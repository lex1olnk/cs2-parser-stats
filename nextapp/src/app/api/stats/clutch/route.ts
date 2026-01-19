// app/api/stats/clutch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const playerId = Number(searchParams.get("playerId"));
    const tournamentId = searchParams.get("tournamentId");

    if (!playerId) {
      return NextResponse.json(
        { error: "playerId is required" },
        { status: 400 }
      );
    }

    // Добавляем задержку для тестирования Suspense
    //await new Promise((resolve) => setTimeout(resolve, 2000));

    const result: any[] = await prisma.$queryRaw`
      SELECT amount
           , success
           , COUNT(*) as count
        FROM match_clutch mc
        JOIN match m 
          ON m.id = mc.match_id
       WHERE mc.user_id      = ${playerId}
         AND m.tournament_id = ${tournamentId}::uuid
    GROUP BY amount, success
    ORDER BY amount, success
    `;

    // Трансформируем данные в удобный формат
    const clutchStats = result.map((row) => ({
      amount: Number(row.amount),
      success: Boolean(row.success),
      count: Number(row.count),
    }));

    return NextResponse.json({
      status: "ok",
      playerId,
      tournamentId,
      clutch: clutchStats,
    });
  } catch (e) {
    console.error("Clutch stats error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
