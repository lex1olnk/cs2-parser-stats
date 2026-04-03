import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [tournament, totalMatches, killsAgg] = await Promise.all([
      prisma.tournament.findUnique({ where: { id } }),
      prisma.match.count({ where: { tournamentId: id } }),
      prisma.matchKill.count({
        where: { match: { tournamentId: id }, isTeamkill: false },
      }),
    ]);

    if (!tournament) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: tournament.name,
      createdAt: tournament.createdAt,
      totalMatches,
      totalKills: killsAgg,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
