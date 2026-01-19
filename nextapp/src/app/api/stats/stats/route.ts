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
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const entryResult: any = await prisma.$queryRaw`
         with cte as (
              select *
                from match_kill mk
               where exists (
                     select 1
                       from match m
                      where mk.match_id = m.id 
                        and m.tournament_id = ${tournamentId}::uuid
                     )
              )
       select sum(case when killer_id = ${playerId} then 1 end) as fk
            , sum(case when victim_id = ${playerId} then 1 end) as fd
         from cte
        where (killer_id = ${playerId} or victim_id = ${playerId}) 
          and (round_time, tick) in (
               select round_time, min(tick) 
                 from cte 
                group by round_time
              )
    `;

    const playerStatsResult: any[] = await prisma.$queryRaw`
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

    const detailedResult: any[] = await prisma.$queryRaw`
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
    // Трансформируем данные в удобный формат
    const entry = {
      firstKills: Number(entryResult.fk),
      firstDeath: Number(entryResult.fd),
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
    console.error("Clutch stats error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
