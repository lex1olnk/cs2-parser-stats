// app/api/parse/callback/route.ts

import { databaseService } from "@/services/server/server-parse-services/database-service";
import { prismaSessionStore } from "@/services/server/server-parse-services/prisma-session-store";
import { isValidInternalRequest } from "@/lib/auth/internal";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Этот роут пишет результаты парсинга прямо в таблицы матчей. Без проверки
  // секрета кто угодно мог бы прислать выдуманную статистику турнира.
  if (!isValidInternalRequest(request)) {
    console.warn("Rejected parse callback: invalid internal token");

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, matchUrl, tournamentId } = getParams(request);
    const result = await request.json();

    console.log(`📨 Callback received for ${matchUrl}`);

    if (result.success) {
      console.log("💾 Saving parsed data to database tables...");

      // ✅ Сохраняем данные напрямую в таблицы БД
      const matchId = await databaseService.saveParsedData(
        sessionId,
        matchUrl,
        tournamentId,
        result.data
      );

      // ✅ Обновляем прогресс - только статус, без данных
      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "completed",
        progress: 100,
        currentStep: "Data saved to database",
        matchId: matchId, // сохраняем ID созданного матча
      });

      console.log(`✅ Data saved to database, match ID: ${matchId}`);
    } else {
      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "error",
        error: result.error,
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("❌ Error in callback:", error);

    // Даже при ошибке сохраняем статус
    try {
      const { sessionId, matchUrl } = getParams(request);
      await prismaSessionStore.updateMatchProgress(sessionId, matchUrl, {
        status: "error",
        error: `Database save failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    } catch (e) {
      console.error("Failed to update error status:", e);
    }

    return NextResponse.json({ error: error }, { status: 500 });
  }
}

// Не экспортируется: route-файл может отдавать наружу только обработчики
// HTTP-методов и служебные настройки, иначе сборка Next падает на проверке типов.
function getParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  const matchUrl = searchParams.get("matchUrl");
  const tournamentId = searchParams.get("tournamentId");

  if (!sessionId || !matchUrl) {
    throw new Error("Missing sessionId or matchUrl parameters");
  }

  return { sessionId, matchUrl, tournamentId };
}
