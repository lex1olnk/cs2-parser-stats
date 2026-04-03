import { demoParserService } from "@/services/server/server-parse-services/demo-parser-service";
import { downloadService } from "@/services/server/server-parse-services/download-service";
import { MatchesService } from "@/services/server/server-parse-services/matchesService";
import { prismaSessionStore } from "@/services/server/server-parse-services/prisma-session-store";
import { prisma } from "@/lib/prisma";
import { validateMatchesInput } from "@/services/server/validation/match-validation";
import { Match, MatchesResponse, MatchNew } from "@/types";
import { NextResponse, NextRequest } from "next/server";

const matchesService: MatchesService = new MatchesService();

function filterValidMatches(matches: any[]) {
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

    // Параметры пагинации
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Параметры сортировки
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Строим фильтр
    const where: {
      tournamentId?: string;
      status?: string;
      type?: string;
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

    // Получаем данные с пагинацией
    const [matches, total] = await Promise.all([
      matchesService.findAll({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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

    const results: Array<{
      matchUrl: string;
      sessionId: string;
      status: string;
    }> = [];

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

    // Запускаем обработку ПОСЛЕДОВАТЕЛЬНО (по одному матчу)
    processMatchesSequentially(results, validMatches);

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
async function processMatchesSequentially(results: any[], validMatches: any[]) {
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

  console.log(`✅ Completed processing all matches sequentially`);
}

// Функция обработки одного матча
async function processSingleMatch(sessionId: string, match: any) {
  let demoPath: string | undefined;

  try {
    console.log(`🔵 Starting match processing: ${match.url}`);

    // Обновляем статус - начало обработки
    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "processing",
      progress: 10,
      currentStep: "Starting download",
    });

    // 1. Скачиваем демо
    await prismaSessionStore.updateMatchProgress(sessionId, match.url, {
      status: "downloading",
      progress: 30,
      currentStep: "Downloading demo file",
    });

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

    // 3. Ждем callback от парсера
    const waitStartTime = Date.now();
    const waitTimeout = 60000; // 60 секунд
    let callbackReceived = false;

    while (Date.now() - waitStartTime < waitTimeout) {
      const session = await prismaSessionStore.getSession(sessionId);
      const matchProgress = session?.matches.find(
        (m: any) => m.url === match.url,
      );

      if (matchProgress?.status === "completed") {
        console.log(`✅ Callback received, parsing completed for ${match.url}`);
        callbackReceived = true;
        break;
      }

      if (matchProgress?.status === "error") {
        throw new Error(`Parsing failed: ${matchProgress.error}`);
      }

      // Ждем 2 секунды перед следующей проверкой
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Проверяем таймаут
    if (!callbackReceived) {
      throw new Error(
        "Parsing timeout - no callback received within 60 seconds",
      );
    }

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
