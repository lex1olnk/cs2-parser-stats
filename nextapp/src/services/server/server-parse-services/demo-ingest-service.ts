// Импорт демок, которые уже лежат в shared-demos.
//
// Основной пайплайн начинается со скачивания по ссылке с Fastcup/Cybershoke.
// Здесь путь короче: файл уже на диске (положен руками, скачан с FACEIT и т.п.),
// поэтому шаг загрузки пропускается.
//
// Принципиальное отличие от пайплайна по URL: файл НЕ удаляется после парсинга.
// Скачанное приложением оно чистит за собой, а положенное человеком трогать
// нельзя — это его исходник, а не временный артефакт.

import fs from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";
import type { MatchProgress } from "@/types/demo-processing";
import { demoParserService } from "./demo-parser-service";
import { prismaSessionStore } from "./prisma-session-store";

export const DEMOS_DIR = path.join(process.cwd(), "..", "shared-demos");

/** Префикс отличает импортированный файл от матча, скачанного по ссылке. */
export const LOCAL_DEMO_PREFIX = "local:";

const ALLOWED_EXTENSIONS = new Set([".dem", ".zip", ".rar"]);
// Те же правила, что в cs-parser/security.js: не отправляем то, что он отвергнет.
const FILE_NAME_PATTERN = /^[A-Za-z0-9._-]+$/;

/**
 * Ожидание callback от парсера. Демка на 30+ раундов разбирается заметно
 * дольше минуты, а по истечении таймаута матч считается неудачным, даже если
 * парсер потом успешно отдаст результат — поэтому запас большой.
 */
export const PARSE_TIMEOUT_MS = Number(process.env.PARSE_TIMEOUT_MS) || 300_000;

export function isValidDemoFileName(fileName: string): boolean {
  return (
    typeof fileName === "string" &&
    fileName.length > 0 &&
    path.basename(fileName) === fileName &&
    FILE_NAME_PATTERN.test(fileName) &&
    ALLOWED_EXTENSIONS.has(path.extname(fileName).toLowerCase())
  );
}

export interface LocalDemo {
  fileName: string;
  sizeMb: number;
  modifiedAt: string;
  /** Уже импортирован — повторно грузить не нужно. */
  imported: boolean;
}

export async function listLocalDemos(): Promise<LocalDemo[]> {
  let entries: string[];

  try {
    entries = await fs.readdir(DEMOS_DIR);
  } catch {
    // Папки может не быть на свежей установке — это не ошибка.
    return [];
  }

  const candidates = entries.filter(isValidDemoFileName);
  if (candidates.length === 0) return [];

  const imported = await prisma.match.findMany({
    where: {
      demoPath: { in: candidates.map((name) => `${LOCAL_DEMO_PREFIX}${name}`) },
    },
    select: { demoPath: true },
  });
  const importedKeys = new Set(imported.map((m) => m.demoPath));

  const demos = await Promise.all(
    candidates.map(async (fileName) => {
      const stats = await fs.stat(path.join(DEMOS_DIR, fileName));

      return {
        fileName,
        sizeMb: Number((stats.size / (1024 * 1024)).toFixed(2)),
        modifiedAt: stats.mtime.toISOString(),
        imported: importedKeys.has(`${LOCAL_DEMO_PREFIX}${fileName}`),
      };
    }),
  );

  return demos.sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
}

/**
 * Ждёт, пока cs-parser отчитается через /api/parse/callback: тот пишет статус
 * в ProcessingSession, а мы его опрашиваем.
 */
export async function waitForParseCallback(
  sessionId: string,
  matchKey: string,
  timeoutMs: number = PARSE_TIMEOUT_MS,
): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const session = await prismaSessionStore.getSession(sessionId);
    const progress = session?.matches.find(
      (m: MatchProgress) => m.url === matchKey,
    );

    if (progress?.status === "completed") return;
    if (progress?.status === "error") {
      throw new Error(`Parsing failed: ${progress.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(
    `Parsing timeout — парсер не ответил за ${Math.round(timeoutMs / 1000)} с`,
  );
}

export interface IngestResult {
  fileName: string;
  matchKey: string;
  status: "completed" | "error" | "skipped";
  error?: string;
}

/** Разбирает один локальный файл и сохраняет матч через callback парсера. */
export async function ingestLocalDemo(
  sessionId: string,
  fileName: string,
  tournamentId: string | null,
): Promise<IngestResult> {
  const matchKey = `${LOCAL_DEMO_PREFIX}${fileName}`;

  try {
    await prismaSessionStore.updateMatchProgress(sessionId, matchKey, {
      status: "parsing",
      progress: 40,
      currentStep: "Отправка демки в парсер",
    });

    const parseResult = await demoParserService.parseDemo(
      sessionId,
      matchKey,
      tournamentId,
      path.join(DEMOS_DIR, fileName),
    );

    if (!parseResult.success) {
      throw new Error(parseResult.error || "Парсер отклонил запрос");
    }

    await waitForParseCallback(sessionId, matchKey);

    return { fileName, matchKey, status: "completed" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await prismaSessionStore.updateMatchProgress(sessionId, matchKey, {
      status: "error",
      error: message,
      currentStep: "Ошибка импорта",
    });

    return { fileName, matchKey, status: "error", error: message };
  }
  // Файл намеренно остаётся на диске: его положил человек.
}
