// app/api/matches/sessions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Получаем ВСЕ сессии за последние 24 часа, включая завершенные
    const twentyFourHoursAgo = new Date(Date.now() - 30 * 60 * 1000);

    const allSessions = await prisma.processingSession.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(allSessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
