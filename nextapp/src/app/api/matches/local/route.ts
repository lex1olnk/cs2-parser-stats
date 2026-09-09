// Импорт демок, уже лежащих в shared-demos.
//
// GET  — что есть на диске и что из этого уже импортировано
// POST — разобрать выбранные файлы и сохранить матчи

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import {
  checkRateLimit,
  releasePipeline,
  tryAcquirePipeline,
} from "@/lib/rate-limit";
import {
  ingestLocalDemo,
  isValidDemoFileName,
  listLocalDemos,
  LOCAL_DEMO_PREFIX,
  type IngestResult,
} from "@/services/server/server-parse-services/demo-ingest-service";
import { prismaSessionStore } from "@/services/server/server-parse-services/prisma-session-store";
import { refreshStatsViews } from "@/services/server/server-parse-services/stats-refresh-service";

export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    return NextResponse.json({ demos: await listLocalDemos() });
  } catch (error) {
    console.error("Failed to list local demos:", error);

    return NextResponse.json(
      { error: "Не удалось прочитать папку с демками" },
      { status: 500 },
    );
  }
}

interface LocalImportRequest {
  files?: Array<{ fileName?: unknown; tournamentId?: unknown }>;
  tournamentId?: unknown;
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const limit = checkRateLimit(`local-import:${guard.user.id}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many import requests", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: LocalImportRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const defaultTournamentId =
    typeof body.tournamentId === "string" && UUID_REGEX.test(body.tournamentId)
      ? body.tournamentId
      : null;

  const requested = Array.isArray(body.files) ? body.files : [];
  const files: Array<{ fileName: string; tournamentId: string | null }> = [];

  for (const entry of requested) {
    const fileName = entry?.fileName;

    // Имя файла приходит от клиента и превращается в путь на диске —
    // проверяем теми же правилами, что и cs-parser.
    if (typeof fileName !== "string" || !isValidDemoFileName(fileName)) {
      return NextResponse.json(
        { error: `Недопустимое имя файла: ${String(fileName)}` },
        { status: 400 },
      );
    }

    const tournamentId =
      typeof entry.tournamentId === "string" &&
      UUID_REGEX.test(entry.tournamentId)
        ? entry.tournamentId
        : defaultTournamentId;

    files.push({ fileName, tournamentId });
  }

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Не выбрано ни одного файла" },
      { status: 400 },
    );
  }

  // Пайплайн работает с общей папкой, параллельные прогоны недопустимы.
  if (!tryAcquirePipeline()) {
    return NextResponse.json(
      { error: "Обработка уже идёт, дождись её завершения" },
      { status: 409 },
    );
  }

  try {
    // Уже импортированные пропускаем: demoPath уникален, повторная вставка
    // всё равно упала бы.
    const existing = await prisma.match.findMany({
      where: {
        demoPath: {
          in: files.map((f) => `${LOCAL_DEMO_PREFIX}${f.fileName}`),
        },
      },
      select: { demoPath: true },
    });
    const alreadyImported = new Set(existing.map((m) => m.demoPath));

    const toProcess = files.filter(
      (f) => !alreadyImported.has(`${LOCAL_DEMO_PREFIX}${f.fileName}`),
    );

    const skipped: IngestResult[] = files
      .filter((f) => alreadyImported.has(`${LOCAL_DEMO_PREFIX}${f.fileName}`))
      .map((f) => ({
        fileName: f.fileName,
        matchKey: `${LOCAL_DEMO_PREFIX}${f.fileName}`,
        status: "skipped" as const,
      }));

    if (toProcess.length === 0) {
      releasePipeline();

      return NextResponse.json({
        results: skipped,
        imported: 0,
        skipped: skipped.length,
        failed: 0,
      });
    }

    const session = await prismaSessionStore.createSession(
      toProcess.map((f) => ({
        url: `${LOCAL_DEMO_PREFIX}${f.fileName}`,
        tournamentId: f.tournamentId,
        platform: "local",
        status: "pending",
        progress: 0,
        currentStep: "Ожидание импорта",
      })),
    );

    // Импорт может занять минуты, поэтому он идёт в фоне, а прогресс виден
    // через /api/matches/sessions — как и у загрузки по ссылке.
    void (async () => {
      try {
        for (const file of toProcess) {
          await ingestLocalDemo(
            session.sessionId,
            file.fileName,
            file.tournamentId,
          );
        }

        await refreshStatsViews();
      } catch (error) {
        console.error("Local import failed:", error);
      } finally {
        releasePipeline();
      }
    })();

    return NextResponse.json({
      sessionId: session.sessionId,
      results: [
        ...skipped,
        ...toProcess.map((f) => ({
          fileName: f.fileName,
          matchKey: `${LOCAL_DEMO_PREFIX}${f.fileName}`,
          status: "pending" as const,
        })),
      ],
      processing: toProcess.length,
      skipped: skipped.length,
      message: "Импорт запущен, следи за прогрессом в сессиях обработки",
    });
  } catch (error) {
    releasePipeline();
    console.error("Local import request failed:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
