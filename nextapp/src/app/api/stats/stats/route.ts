// app/api/stats/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    if (!tournamentId || !UUID_REGEX.test(tournamentId)) {
      return NextResponse.json(
        { error: "tournamentId must be a UUID" },
        { status: 400 },
      );
    }

    // Первое убийство раунда — минимальный тик внутри round_id. Группировка
    // по round_time была неверной: это время внутри раунда, а не его
    // идентификатор, поэтому «первые» убийства собирались со всех раундов
    // сразу и entry-статистика получалась завышенной.
    const entryRows: Array<{ fk: bigint | null; fd: bigint | null }> =
      await prisma.$queryRaw`
         with first_kills as (
              select distinct on (mk.round_id)
                     mk.killer_id
                   , mk.victim_id
                from match_kill mk
                join match m on m.id = mk.match_id
               where m.tournament_id = ${tournamentId}::uuid
                 and mk.is_teamkill = false
               order by mk.round_id, mk.tick asc
              )
       select count(*) filter (where killer_id = ${playerId}) as fk
            , count(*) filter (where victim_id = ${playerId}) as fd
         from first_kills
    `;

    // Значения приходят из count/sum, то есть int8 -> bigint;
    // у строки-разделителя 'empty' значение null.
    type BasicStatRow = {
      id: number;
      title: string;
      value: bigint | number | null;
      ord: number;
      visible: number;
    };

    const playerStatsResult: BasicStatRow[] = await prisma.$queryRaw`
              select 1         as id
                   , 'Matches' as title
                   , count(*)  as value
                   , 1         as ord
                   , 1         as visible
                from match_member mm 
               where exists (
                         select 1
                           from match m
                          where m.tournament_id = ${tournamentId}::uuid 
                            and m.id = mm.match_id 
                     ) 
                 and user_id = ${playerId}
               union
              select 2
                   , 'GrenadeDamage'
                   , sum(damage_normalized)
                   , 2
                   , 1
                from match_damage md
               where exists (
                         select 1
                           from match m
                          where m.tournament_id = ${tournamentId}::uuid 
                            and m.id = md.match_id 
                     ) 
                 and inflictor_id = ${playerId} 
                 and exists (
                         select 1
                         from weapon w
                         where w.weapon_id = md.weapon_id and w."type" = 'grenade'
                     )
               group by inflictor_id
               union 
              select 3
                   , 'empty'
                   , null
                   , 3
                   , 1
               union
              select 4
                   , 'trading'
                   , count(*)
                   , 4
                   , 1
                from match_kill_with_trade mk
               where exists (
                         select 1
                           from match m
                          where m.tournament_id = ${tournamentId}::uuid 
                            and m.id = mk.match_id 
                     ) 
                 and killer_id = ${playerId} 
                 and mk.is_tradekill = true
               order by ord
    `;

    type DetailedStatRow = BasicStatRow & { card: number };

    const detailedResult: DetailedStatRow[] = await prisma.$queryRaw`
              select 1            as id
                   , 1            as card
                   , 'Damage' as title
                   , sum(damage)  as value
                   , 1            as ord
                   , 1            as visible
                from damage_stats_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id
               union
              select 2
                   , 1
                   , 'Rounds'
                   , sum(rounds)
                   , 2
                   , 1
                from rounds_played_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id
               union 
              select 3
                   , 2
                   , 'Kills'
                   , sum(kills)
                   , 1
                   , 1
                from kill_stats_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id
               union 
              select 4
                   , 2
                   , 'Deaths'
                   , sum(deaths)
                   , 2
                   , 1
                from death_stats_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id
               union 
              select 5
                   , 2
                   , 'Assists'
                   , sum(assists)
                   , 3
                   , 1
                from assist_stats_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id
               union 
              select 6
                   , 3
                   , 'Headshots'
                   , sum(hs_kills)
                   , 1
                   , 1
                from kill_stats_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id
               union 
              select 7
                   , 4
                   , 'KAST'
                   , round(sum(kast_rounds) / sum(total_rounds) * 100, 2)
                   , 1
                   , 1
                from kast_per_match
               where player_id = ${playerId}
                 and tournament_id = ${tournamentId}::uuid
               group by player_id`;
    // $queryRaw всегда возвращает массив строк — раньше поля читались прямо
    // с массива и превращались в NaN.
    const entry = {
      firstKills: Number(entryRows[0]?.fk ?? 0),
      firstDeath: Number(entryRows[0]?.fd ?? 0),
    };

    const basic = playerStatsResult.map((res) => ({
      title: res.title,
      value: Number(res.value),
    }));

    const detailed = Object.values(Object.groupBy(detailedResult, d => d.card)).map(d => d)
    

    return NextResponse.json({
      status: "ok",
      playerId,
      tournamentId,
      stats: {
        entry,
        basic,
        detailed,
      },
    });
  } catch (e) {
    console.error("Player stats error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
