import { PlayerLeaderboard } from "@/components/features/player/PlayerLeaderboard";
import { prisma } from "@/lib/prisma";
import { MIN_RANKED_ROUNDS, ratingComponents } from "@/lib/rating";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LeaderboardRow = {
  id: number;
  nickname: string;
  team: string;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  kast_rounds: number;
  hs_kills: number;
};

async function getTopPlayers(tournamentId: string) {
  if (!UUID_REGEX.test(tournamentId)) return [];

  const rows: LeaderboardRow[] = await prisma.$queryRaw`
    WITH agg AS (
      SELECT player_id,
             SUM(rounds)::int      AS rounds,
             SUM(kills)::int       AS kills,
             SUM(deaths)::int      AS deaths,
             SUM(assists)::int     AS assists,
             SUM(damage)::int      AS damage,
             SUM(kast_rounds)::int AS kast_rounds,
             SUM(hs_kills)::int    AS hs_kills
      FROM player_rating2_components_per_match
      WHERE tournament_id = ${tournamentId}::uuid
      GROUP BY player_id
      -- Иначе первым в топе окажется тот, кто сыграл два раунда и сделал
      -- три убийства: на такой выборке любая метрика за раунд взлетает.
      HAVING SUM(rounds) >= ${MIN_RANKED_ROUNDS}
    )
    SELECT
      u.id,
      u.nickname,
      COALESCE(tt.name, '—') AS team,
      a.rounds, a.kills, a.deaths, a.assists, a.damage, a.kast_rounds, a.hs_kills
    FROM agg a
    JOIN "user" u ON u.id = a.player_id
    LEFT JOIN profile p ON p.id = u.profile_id
    LEFT JOIN tournament_participant tp
           ON tp.profile_id = p.id
          AND tp.tournament_id = ${tournamentId}::uuid
    LEFT JOIN tournament_team tt ON tt.id = tp.tournament_team_id
    ORDER BY
        0.0073 * (a.kast_rounds::float / GREATEST(a.rounds, 1) * 100)
      + 0.3591 * (a.kills::float   / GREATEST(a.rounds, 1))
      - 0.5329 * (a.deaths::float  / GREATEST(a.rounds, 1))
      + 0.2372 * (2.13 * (a.kills::float   / GREATEST(a.rounds, 1))
                + 0.42 * (a.assists::float / GREATEST(a.rounds, 1)) - 0.41)
      + 0.0032 * (a.damage::float  / GREATEST(a.rounds, 1))
      + 0.1587 DESC
    LIMIT 15
  `;

  return rows.map((row) => {
    const totals = {
      kills: Number(row.kills),
      deaths: Number(row.deaths),
      assists: Number(row.assists),
      damage: Number(row.damage),
      kastRounds: Number(row.kast_rounds),
      rounds: Number(row.rounds),
    };
    const { adr, rating } = ratingComponents(totals);

    return {
      id: Number(row.id),
      nickname: row.nickname,
      team: row.team,
      kills: totals.kills,
      adr,
      hs:
        totals.kills > 0
          ? Math.round((Number(row.hs_kills) / totals.kills) * 100)
          : 0,
      rating,
    };
  });
}

export default async function PlayersTopPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const { tournament } = await searchParams;
  const tournamentId = tournament ?? "";
  const players = await getTopPlayers(tournamentId);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-12">
        <header className="mb-20 border-l-4 border-white pl-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-zinc-600 font-mono text-xs tracking-[0.5em]">
              DATA_EXTRACT // PLAYERS_STAT
            </span>
            <div className="h-px w-24 bg-zinc-800" />
          </div>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">
            Top_Performers <br />
            <span className="text-zinc-800">[{tournamentId || "—"}]</span>
          </h1>
        </header>

        <div className="grid grid-cols-12 gap-16">
          <div className="col-span-12 lg:col-span-9">
            {players.length === 0 ? (
              <p className="font-mono text-zinc-600 text-sm">
                {tournamentId
                  ? "NO_DATA_FOR_TOURNAMENT"
                  : "NO_TOURNAMENT_SELECTED"}
              </p>
            ) : (
              <PlayerLeaderboard players={players} />
            )}
          </div>

          <aside className="col-span-3 hidden lg:block space-y-12">
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 italic">
                Performance_Legend
              </h4>
              <div className="space-y-4 font-mono text-[10px]">
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 bg-white" />
                  <span className="text-zinc-400">Rating &gt; 1.20 (ELITE)</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 bg-zinc-600" />
                  <span className="text-zinc-400">Rating &gt; 1.00 (GOOD)</span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 bg-zinc-800" />
                  <span className="text-zinc-600">AVERAGE_ZONE (~1.00)</span>
                </div>
              </div>
            </div>

            <div className="p-6 border border-zinc-900 bg-zinc-900/10">
              <p className="text-[9px] leading-relaxed text-zinc-500 font-mono italic">
                Rating = HLTV 2.0, тот же, что показывает FACEIT:
                0.0073·KAST + 0.359·KPR − 0.533·DPR + 0.237·Impact + 0.0032·ADR
                + 0.159, где Impact = 2.13·KPR + 0.42·APR − 0.41. KPR/DPR/APR —
                убийства, смерти и ассисты за раунд, ADR — урон за раунд,
                KAST — % раундов с убийством, ассистом, выживанием или разменом.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
