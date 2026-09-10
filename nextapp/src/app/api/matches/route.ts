import { demoParserService } from "@/services/server/server-parse-services/demo-parser-service";
import { downloadService } from "@/services/server/server-parse-services/download-service";
import { MatchesService } from "@/services/server/server-parse-services/matchesService";
import { prismaSessionStore } from "@/services/server/server-parse-services/prisma-session-store";
import { refreshStatsViews } from "@/services/server/server-parse-services/stats-refresh-service";
import { waitForParseCallback } from "@/services/server/server-parse-services/demo-ingest-service";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import type { MatchInput } from "@/types/demo-processing";
import {
  checkRateLimit,
  isPipelineBusy,
  releasePipeline,
  tryAcquirePipeline,
} from "@/lib/rate-limit";
import { NextResponse, NextRequest } from "next/server";

const matchesService: MatchesService = new MatchesService();

// Имена полей сортировки приходят из query и подставляются в orderBy —
// поэтому только из белого списка, а не как есть.
const SORTABLE_FIELDS = [
  "createdAt",
  "startedAt",
  "finishedAt",
  "status",
  "type",
] as const;

function parseOrderBy(sortBy: string | null, sortOrder: string | null) {
  const field = SORTABLE_FIELDS.includes(sortBy as never)
    ? (sortBy as (typeof SORTABLE_FIELDS)[number])
    : "createdAt";
  const direction = sortOrder === "asc" ? "asc" : "desc";

  return { [field]: direction };
}

/** Результат создания сессии на один матч. */
type MatchQueueEntry = {
  matchUrl: string;
  sessionId: string;
  status: string;
};

function filterValidMatches(matches: MatchInput[]) {
  return matches.filter((match) => {
    if (!match.url) return false;

    // Проверяем URL на валидность
    const FASTCUP_URL_REGEX = /https:\/\/cs2\.fastcup\.net\/matches\/\d+/;
    const CYBERSHOKE_URL_REGEX = /https:\/\/cybershoke\.net\/\w+\/match\/\d+/;

    const urlMatch = match.url.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch ? urlMatch[0] : match.url;

    const isValid =
      FASTCUP_URL_REGEX.test(url) || CYBERSHOKE_URL_REGEX.test(url);

    if (isValid) {
      // Оставляем только валидную часть URL
      if (FASTCUP_URL_REGEX.test(url)) {
        const fastcupMatch = url.match(FASTCUP_URL_REGEX);
        match.url = fastcupMatch ? fastcupMatch[0] : url;
      } else if (CYBERSHOKE_URL_REGEX.test(url)) {
        const cybershokeMatch = url.match(CYBERSHOKE_URL_REGEX);
        match.url = cybershokeMatch ? cybershokeMatch[0] : url;
      }
    }

    return isValid;
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Параметры фильтрации
    const tournamentId = searchParams.get("tournamentId");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const dateFrom = searchParams.get("dateFrom");

    // Параметры пагинации. Числа приходят из query, поэтому мусор вроде
    // ?page=abc не должен превращаться в NaN и уносить skip в NaN за ним.
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20),
    );
    const skip = (page - 1) * limit;

    // Параметры сортировки
    const orderBy = parseOrderBy(
      searchParams.get("sortBy"),
      searchParams.get("sortOrder"),
    );

    // Строим фильтр
    const where: {
      tournamentId?: string;
      status?: string;
      type?: string;
      startedAt?: { gte: Date };
    } = {};

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    // Дата приходит из поля ввода как YYYY-MM-DD. Неразобранную дату молча
    // пропускаем: пустой список из-за опечатки хуже, чем нефильтрованный.
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!Number.isNaN(from.getTime())) {
        where.startedAt = { gte: from };
      }
    }

    // Получаем данные с пагинацией
    const [matches, total] = await Promise.all([
      matchesService.findAll({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          tournament: true,
          teams: true,
          maps: true,
        },
      }),
      matchesService.count({ where }),
    ]);

    // Метаданные пагинации
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      data: matches,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null,
      },
      filters: {
        tournamentId,
        status,
        type,
        dateFrom,
      },
    });
  } catch (error) {
    console.error("Failed to fetch matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Загрузка матча тянет за собой внешние запросы, скачивание файлов на диск
  // и запись в БД — только для админов.
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const limit = checkRateLimit(`matches:${guard.user.id}`, 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many upload requests", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  // Пайплайн работает с общей папкой shared-demos, поэтому второй
  // параллельный прогон затирал бы файлы первого.
  if (isPipelineBusy()) {
    return NextResponse.json(
      { error: "Обработка уже идёт, дождись её завершения" },
      { status: 409 },
    );
  }

  try {
    const body = await request.json();

    if (!body.matches) {
      return NextResponse.json(
        { error: "Missing matches array" },
        { status: 400 },
      );
    }

    // Валидация и фильтрация матчей
    const validMatches = filterValidMatches(body.matches);

    const results: MatchQueueEntry[] = [];

    // Создаем сессии для каждого матча
    for (const match of validMatches) {
      // Проверяем существующий матч
      const existingMatch = await prisma.match.findUnique({
        where: { demoPath: match.url },
      });

      if (existingMatch) {
        results.push({
          matchUrl: match.url,
          sessionId: "already_exists",
          status: "skipped",
        });
        continue;
      }

      // Создаем индивидуальную сессию для матча
      const individualSession = await prismaSessionStore.createSession([
        {
          url: match.url,
          tournamentId: match.tournamentId,
          platform: match.platform,
          status: "pending",
          progress: 0,
          currentStep: "Waiting to start",
        },
      ]);

      results.push({
        matchUrl: match.url,
        sessionId: individualSession.sessionId,
        status: "pending",
      });
    }

    // Запускаем обработку ПОСЛЕДОВАТЕЛЬНО (по одному матчу).
    // Флаг снимается в любом случае, иначе один сбой заблокирует загрузки
    // до перезапуска процесса.
    if (!tryAcquirePipeline()) {
      return NextResponse.json(
        { error: "Обработка уже идёт, дождись её завершения" },
        { status: 409 },
      );
    }

    processMatchesSequentially(results, validMatches)
      .catch((error) => console.error("Pipeline failed:", error))
      .finally(releasePipeline);

    return NextResponse.json({
      results: results,
      total: results.length,
      processing: results.filter((r) => r.status === "pending").length,
      skipped: results.filter((r) => r.status === "skipped").length,
      message: "Matches are being processed sequentially (one by one)",
    });
  } catch (error) {
    console.error("Error processing matches request:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

// Последовательная обработка матчей
async function processMatchesSequentially(
  results: MatchQueueEntry[],
  validMatches: MatchInput[]
) {
  const processingMatches = results.filter((r) => r.status === "pending");

  console.log(
    `Starting SEQUENTIAL processing of ${processingMatches.length} matches`,
  );

  for (let i = 0; i < processingMatches.length; i++) {
    const result = processingMatches[i];

    // Находим полные данные матча по URL
    const matchData = validMatches.find((m) => m.url === result.matchUrl);

    if (!matchData) {
      console.error(`Match data not found for URL: ${result.matchUrl}`);
      continue;
    }

    console.log(
      `🔵 Processing match ${i + 1}/${processingMatches.length}: ${result.matchUrl}`,
    );

    // Обрабатываем один матч и ЖДЕМ его завершения
    await processSingleMatch(result.sessionId, matchData);

    // Пауза между матчами (2 секунды)
    if (i < processingMatches.length - 1) {
      console.log(`⏸️ Waiting 2 seconds before next match...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Без пересчёта вьюшек загруженные матчи не появятся в лидербордах.
  // Делаем это один раз на всю пачку, а не после каждого матча.
  if (processingMatches.length > 0) {
    await refreshStatsViews();
  }

  console.log(`✅ Completed processing all matches sequentially`);
}

// Функция обработки одного матча
async function processSingleMatch(sessionId: string, match: MatchInput) {
  let demoPath: string | undefined;

  try {
    console.log(`🔵 Starting match processing: ${match.url}`);

    // 1. Скачиваем демо.
    // Раньше здесь был ещё один апдейт со статусом "processing" — такого
    // статуса у матча нет (есть pending/downloading/parsing/completed/error),
    // и он всё равно затирался следующей строкой без единой операции между.
    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "downloading",
      progress: 30,
      currentStep: "Downloading demo file",
    });

    // Импорт из папки идёт своим роутом и до сюда не доходит:
    // filterValidMatches пропускает только ссылки fastcup и cybershoke.
    if (match.platform === "local") {
      throw new Error(
        "Local demos are imported through /api/matches/local, not this pipeline"
      );
    }

    const downloadResult = await downloadService.downloadDemo(
      sessionId,
      match.url,
      match.platform,
    );

    if (!downloadResult.success || !downloadResult.demoPath) {
      throw new Error(`Download failed: ${downloadResult.error}`);
    }

    demoPath = downloadResult.demoPath;
    console.log(`✅ Demo downloaded: ${demoPath}`);

    // 2. Отправляем на парсинг
    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "parsing",
      progress: 60,
      currentStep: "Sending demo to parser",
    });

    const parseResult = await demoParserService.parseDemo(
      sessionId,
      match.url,
      match.tournamentId,
      demoPath,
    );

    if (!parseResult.success) {
      throw new Error(`Parse failed: ${parseResult.error}`);
    }

    console.log(`✅ Demo sent to parser, waiting for callback...`);

    // 3. Ждем callback от парсера (та же логика, что и у импорта локальных демок)
    await waitForParseCallback(sessionId, match.url);
    console.log(`✅ Callback received, parsing completed for ${match.url}`);

    // 4. Успешное завершение
    console.log(`🎉 Match processing completed successfully: ${match.url}`);
  } catch (error) {
    console.error(`❌ Error processing match ${match.url}:`, error);

    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      currentStep: "Error occurred during processing",
    });
  } finally {
    // Очищаем файл при ошибке
    if (demoPath) {
      await downloadService.cleanupDemoFile(demoPath);
    }
  }
}
