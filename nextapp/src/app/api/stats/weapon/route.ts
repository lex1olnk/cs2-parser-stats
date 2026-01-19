import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    console.log({ searchParams });
    const playerId = Number(searchParams.get("playerId")!);
    const tournamentId = searchParams.get("tournamentId");

    if (!searchParams.get("playerId")) {
      return NextResponse.json(
        { error: "playerId is required" },
        { status: 400 }
      );
    }

    const result: any[] = await prisma.$queryRaw`
       SELECT w.internal_name as weapon
            , mk.killer_id    as player_id
            , COUNT(*)        as total_kills
            , SUM(CASE WHEN mk.is_wallbang THEN 1 ELSE 0 END) as wallbang
            , SUM(CASE WHEN mk.is_headshot THEN 1 ELSE 0 END) as headshot
            , SUM(CASE WHEN mk.is_airshot THEN 1 ELSE 0 END)  as airshot
            , SUM(CASE WHEN mk.is_noscope THEN 1 ELSE 0 END)  as noscope
         FROM match_kill mk
         JOIN weapon w ON mk.weapon_id = w.weapon_id
         join match m on m.id = mk.match_id
        WHERE w.internal_name IN ('ak47', 'm4a1_silencer', 'm4a1', 'awp', 'deagle', 'glock', 'usp_silencer', 'ssg08')
          and mk.killer_id    = ${playerId}
          and m.tournament_id = ${tournamentId}::uuid
     GROUP BY w.internal_name
            , mk.killer_id
     ORDER BY w.internal_name
    `;

    return NextResponse.json({
      status: "ok",
      playerId,
      tournamentId,
      weapons: result.map((row) => ({
        weapon: row.weapon,
        kills: Number(row.total_kills),
        wallbang: Number(row.wallbang),
        headshot: Number(row.headshot),
        airshot: Number(row.airshot),
        noscope: row.noscope ? Number(row.noscope) : null,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: e });
  }
}
