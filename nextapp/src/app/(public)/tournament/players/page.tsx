import { PlayerLeaderboard } from "@/components/features/player/PlayerLeaderboard";
import { prisma } from "@/lib/prisma";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getTopPlayers(tournamentId: string) {
  if (!UUID_REGEX.test(tournamentId)) return [];

  // HLTV Rating 1.0:
  //   0.3591*(kills/R) + 0.4778*(survived/R) + 0.3658*(multi_kill/R)
  //   - 0.394*(deaths/R) + 0.2778
  // где R — суммарное число сыгранных раундов по матчам турнира.
  const rows: any[] = await prisma.$queryRaw`
    SELECT
      u.id,
      u.nickname,
      COALESCE(tt.name, '—') AS team,
      COALESCE(c.kills,             0)::int AS kills,
      COALESCE(c.deaths,            0)::int AS deaths,
      COALESCE(c.multi_kill_rounds, 0)::int AS multi_kill_rounds,
      COALESCE(c.survived_rounds,   0)::int AS survived_rounds,
      COALESCE(c.total_rounds,      1)::int AS rounds,
      COALESCE(k.hs_kills,          0)::int AS hs_kills,
      COALESCE(d.damage,            0)::int AS damage
    FROM (
      SELECT
        player_id,
        SUM(kills)             AS kills,
        SUM(deaths)            AS deaths,
        SUM(multi_kill_rounds) AS multi_kill_rounds,
        SUM(survived_rounds)   AS survived_rounds,
        SUM(total_rounds)      AS total_rounds
      FROM player_rating_components_per_match
      WHERE tournament_id = ${tournamentId}::uuid
      GROUP BY player_id
    ) c
    JOIN "user" u ON u.id = c.player_id
    LEFT JOIN (
      SELECT player_id, SUM(hs_kills) AS hs_kills
      FROM kill_stats_per_match
      WHERE tournament_id = ${tournamentId}::uuid
      GROUP BY player_id
    ) k ON k.player_id = c.player_id
    LEFT JOIN (
      SELECT player_id, SUM(damage) AS damage
      FROM damage_stats_per_match
      WHERE tournament_id = ${tournamentId}::uuid
      GROUP BY player_id
    ) d ON d.player_id = c.player_id
    LEFT JOIN profile p ON p.id = u.profile_id
    LEFT JOIN tournament_participant tp
           ON tp.profile_id = p.id
          AND tp.tournament_id = ${tournamentId}::uuid
    LEFT JOIN tournament_team tt ON tt.id = tp.tournament_team_id
    ORDER BY
      0.3591 * (c.kills::float             / GREATEST(c.total_rounds, 1))
    + 0.4778 * (c.survived_rounds::float   / GREATEST(c.total_rounds, 1))
    + 0.3658 * (c.multi_kill_rounds::float / GREATEST(c.total_rounds, 1))
    - 0.394  * (c.deaths::float            / GREATEST(c.total_rounds, 1))
    + 0.2778 DESC
    LIMIT 15
  `;

  return rows.map((row) => {
    const kills = Number(row.kills);
    const deaths = Number(row.deaths);
    const rounds = Number(row.rounds);
    const damage = Number(row.damage);
    const hsKills = Number(row.hs_kills);
    const multiKill = Number(row.multi_kill_rounds);
    const survived = Number(row.survived_rounds);

    const rating =
      rounds > 0
        ? 0.3591 * (kills / rounds) +
          0.4778 * (survived / rounds) +
          0.3658 * (multiKill / rounds) -
          0.394 * (deaths / rounds) +
          0.2778
        : 0;

    return {
      id: Number(row.id),
      nickname: row.nickname as string,
      team: row.team as string,
      kills,
      adr: rounds > 0 ? damage / rounds : 0,
      hs: kills > 0 ? Math.round((hsKills / kills) * 100) : 0,
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
                Rating = HLTV 1.0: 0.359·KPR + 0.478·SPR + 0.366·RMK − 0.394·DPR + 0.278.
                KPR/DPR/SPR — kills/deaths/survived за раунд, RMK — доля раундов с
                2+ убийствами. ADR = урон за раунд. HS% = % убийств в голову.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
