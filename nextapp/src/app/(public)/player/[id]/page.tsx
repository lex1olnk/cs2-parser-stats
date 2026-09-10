import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  MIN_RANKED_ROUNDS,
  impactRating,
  ratingComponents,
} from "@/lib/rating";
import { PlayerCard } from "@/components/features/player/PlayerCard";
import {
  StatsGrid,
  type StatCardData,
  type MiniStatData,
} from "@/components/features/player/StatsGrid";
import {
  ClutchStats,
  type ClutchStat,
} from "@/components/features/player/ClutchStats";
import {
  DuelMasters,
  type DuelStat,
} from "@/components/features/player/DuelMasters";
import {
  PlayerMatches,
  type PlayerMatchRow,
} from "@/components/features/player/PlayerMatches";

// Страница показывает статистику игрока за все матчи, которые попали в базу.
// Разрез по турниру живёт отдельно — на /tournament/players.

type MatchRow = {
  match_id: string;
  started_at: Date;
  map_name: string | null;
  team_name: string | null;
  team_score: number | null;
  is_winner: boolean | null;
  opponent_name: string | null;
  opponent_score: number | null;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  kast_rounds: number;
  swing: number | null;
};

/**
 * Матчи игрока с его показателями в каждом.
 *
 * Соперник ищется как вторая команда того же матча — в базе их ровно две,
 * поэтому достаточно исключить свою.
 */
async function getMatches(playerId: number): Promise<MatchRow[]> {
  return prisma.$queryRaw<MatchRow[]>`
    SELECT m.id                              AS match_id,
           m.started_at,
           mp.name                           AS map_name,
           own.name                          AS team_name,
           own.score                         AS team_score,
           own.is_winner                     AS is_winner,
           foe.name                          AS opponent_name,
           foe.score                         AS opponent_score,
           COALESCE(rp.rounds, 0)::int       AS rounds,
           COALESCE(k.kills, 0)::int         AS kills,
           COALESCE(d.deaths, 0)::int        AS deaths,
           COALESCE(a.assists, 0)::int       AS assists,
           COALESCE(dmg.damage, 0)::int      AS damage,
           COALESCE(ka.kast_rounds, 0)::int  AS kast_rounds,
           sw.swing
    FROM match_member mm
    JOIN match m           ON m.id = mm.match_id
    LEFT JOIN match_team own ON own.id = mm.match_team_id
    LEFT JOIN match_team foe ON foe.match_id = m.id AND foe.id <> mm.match_team_id
    LEFT JOIN match_map mmap ON mmap.match_id = m.id
    LEFT JOIN map mp         ON mp.id = mmap.map_id
    LEFT JOIN rounds_played_per_match rp
           ON rp.player_id = mm.user_id AND rp.match_id = m.id
    LEFT JOIN kill_stats_per_match k
           ON k.player_id = mm.user_id AND k.match_id = m.id
    LEFT JOIN death_stats_per_match d
           ON d.player_id = mm.user_id AND d.match_id = m.id
    LEFT JOIN assist_stats_per_match a
           ON a.player_id = mm.user_id AND a.match_id = m.id
    LEFT JOIN damage_stats_per_match dmg
           ON dmg.player_id = mm.user_id AND dmg.match_id = m.id
    LEFT JOIN kast_per_match ka
           ON ka.player_id = mm.user_id AND ka.match_id = m.id
    LEFT JOIN player_swing_per_match sw
           ON sw.player_id = mm.user_id AND sw.match_id = m.id
    WHERE mm.user_id = ${playerId}
    ORDER BY m.started_at DESC
    LIMIT 20
  `;
}

type TotalsRow = {
  player_id: number;
  kills: number;
  deaths: number;
  rounds: number;
  survived: number;
  multi_kills: number;
  damage: number;
  hs_kills: number;
  assists: number;
  kast_rounds: number;
  kast_total: number;
  swing: number | null;
  impact_frags: number | null;
  exit_frags: number | null;
  adr: number;
  kd: number;
  hs_ratio: number;
  rating: number;
  /** null, если у игрока меньше MIN_RANKED_ROUNDS раундов. */
  adr_rank: number | null;
  kd_rank: number | null;
  hs_rank: number | null;
  rating_rank: number | null;
  /** Сколько игроков вообще участвует в ранжировании. */
  players_ranked: number;
};



// Рейтинг — HLTV 2.0, тот же, что показывает FACEIT (см. lib/rating.ts).
// Считается прямо в SQL, чтобы ранги по всем игрокам брались одним проходом
// через RANK(), а не тянули всю таблицу в приложение.
async function getTotals(playerId: number): Promise<TotalsRow | null> {
  const rows: TotalsRow[] = await prisma.$queryRaw`
    WITH base AS (
      SELECT c.player_id,
             SUM(c.kills)::int             AS kills,
             SUM(c.deaths)::int            AS deaths,
             SUM(c.total_rounds)::int      AS rounds,
             SUM(c.survived_rounds)::int   AS survived,
             SUM(c.multi_kill_rounds)::int AS multi_kills
      FROM player_rating_components_per_match c
      GROUP BY c.player_id
    ),
    dmg AS (
      SELECT player_id, SUM(damage)::int AS damage
      FROM damage_stats_per_match GROUP BY player_id
    ),
    hs AS (
      SELECT player_id, SUM(hs_kills)::int AS hs_kills
      FROM kill_stats_per_match GROUP BY player_id
    ),
    ast AS (
      SELECT player_id, SUM(assists)::int AS assists
      FROM assist_stats_per_match GROUP BY player_id
    ),
    kast AS (
      SELECT player_id,
             SUM(kast_rounds)::int  AS kast_rounds,
             SUM(total_rounds)::int AS kast_total
      FROM kast_per_match GROUP BY player_id
    ),
    sw AS (
      SELECT player_id,
             SUM(swing)        AS swing,
             SUM(impact_frags)::int AS impact_frags,
             SUM(exit_frags)::int   AS exit_frags
      FROM player_swing_per_match GROUP BY player_id
    ),
    metrics AS (
      SELECT b.player_id, b.kills, b.deaths, b.rounds, b.survived, b.multi_kills,
             COALESCE(d.damage, 0)      AS damage,
             COALESCE(h.hs_kills, 0)    AS hs_kills,
             COALESCE(a.assists, 0)     AS assists,
             COALESCE(k.kast_rounds, 0) AS kast_rounds,
             COALESCE(k.kast_total, 0)  AS kast_total,
             s.swing,
             s.impact_frags,
             s.exit_frags,
             COALESCE(d.damage, 0)::float   / GREATEST(b.rounds, 1)  AS adr,
             b.kills::float                 / GREATEST(b.deaths, 1)  AS kd,
             COALESCE(h.hs_kills, 0)::float / GREATEST(b.kills, 1)   AS hs_ratio,
               0.0073 * (COALESCE(k.kast_rounds, 0)::float / GREATEST(b.rounds, 1) * 100)
             + 0.3591 * (b.kills::float  / GREATEST(b.rounds, 1))
             - 0.5329 * (b.deaths::float / GREATEST(b.rounds, 1))
             + 0.2372 * (2.13 * (b.kills::float                / GREATEST(b.rounds, 1))
                       + 0.42 * (COALESCE(a.assists, 0)::float / GREATEST(b.rounds, 1))
                       - 0.41)
             + 0.0032 * (COALESCE(d.damage, 0)::float / GREATEST(b.rounds, 1))
             + 0.1587 AS rating
      FROM base b
      LEFT JOIN dmg  d ON d.player_id = b.player_id
      LEFT JOIN hs   h ON h.player_id = b.player_id
      LEFT JOIN ast  a ON a.player_id = b.player_id
      LEFT JOIN kast k ON k.player_id = b.player_id
      LEFT JOIN sw   s ON s.player_id = b.player_id
    ),
    -- Ранги считаются только среди тех, кто наиграл достаточно раундов.
    -- Игроку ниже порога место не присваивается вовсе: чужой список его
    -- не касается, а показывать «#1 из 3» по двум раундам — обман.
    ranked AS (
      SELECT m.player_id,
             (RANK() OVER (ORDER BY m.adr      DESC))::int AS adr_rank,
             (RANK() OVER (ORDER BY m.kd       DESC))::int AS kd_rank,
             (RANK() OVER (ORDER BY m.hs_ratio DESC))::int AS hs_rank,
             (RANK() OVER (ORDER BY m.rating   DESC))::int AS rating_rank,
             (COUNT(*) OVER ())::int                       AS players_ranked
      FROM metrics m
      WHERE m.rounds >= ${MIN_RANKED_ROUNDS}
    )
    SELECT m.*,
           r.adr_rank,
           r.kd_rank,
           r.hs_rank,
           r.rating_rank,
           COALESCE((SELECT MAX(players_ranked) FROM ranked), 0) AS players_ranked
    FROM metrics m
    LEFT JOIN ranked r ON r.player_id = m.player_id
    WHERE m.player_id = ${playerId}
  `;

  return rows[0] ?? null;
}

// 1v1 … 1v5. Пустые категории тоже показываем, иначе строка «съезжает».
async function getClutches(playerId: number): Promise<ClutchStat[]> {
  const grouped = await prisma.matchClutch.groupBy({
    by: ["amount", "success"],
    where: { userId: playerId },
    _count: { _all: true },
  });

  return [1, 2, 3, 4, 5].map((amount) => {
    const won =
      grouped.find((g) => g.amount === amount && g.success)?._count._all ?? 0;
    const lost =
      grouped.find((g) => g.amount === amount && !g.success)?._count._all ?? 0;
    const total = won + lost;

    return {
      type: `1v${amount}`,
      win: total > 0 ? Math.round((won / total) * 100) : 0,
      rounds: total,
    };
  });
}

// Первое убийство в раунде — по минимальному тику внутри раунда. Группировать
// по round_time нельзя: это время внутри раунда, а не идентификатор раунда.
async function getEntryDuels(playerId: number) {
  const rows: Array<{ won: number; lost: number }> = await prisma.$queryRaw`
    WITH first_kills AS (
      SELECT DISTINCT ON (mk.round_id) mk.round_id, mk.killer_id, mk.victim_id
      FROM match_kill mk
      WHERE mk.is_teamkill = false
      ORDER BY mk.round_id, mk.tick ASC
    )
    SELECT COUNT(*) FILTER (WHERE killer_id = ${playerId})::int AS won,
           COUNT(*) FILTER (WHERE victim_id = ${playerId})::int AS lost
    FROM first_kills
  `;

  const won = rows[0]?.won ?? 0;
  const lost = rows[0]?.lost ?? 0;
  const total = won + lost;

  return { won, lost, percent: total > 0 ? (won / total) * 100 : 0 };
}

async function getDuelOpponents(playerId: number): Promise<DuelStat[]> {
  const rows: Array<{ nickname: string; won: number; lost: number }> =
    await prisma.$queryRaw`
      WITH duels AS (
        SELECT CASE WHEN mk.killer_id = ${playerId} THEN mk.victim_id
                    ELSE mk.killer_id END AS opponent_id,
               CASE WHEN mk.killer_id = ${playerId} THEN 1 ELSE 0 END AS won
        FROM match_kill mk
        WHERE mk.is_teamkill = false
          AND mk.killer_id IS NOT NULL
          AND (mk.killer_id = ${playerId} OR mk.victim_id = ${playerId})
      )
      SELECT u.nickname,
             SUM(d.won)::int              AS won,
             (COUNT(*) - SUM(d.won))::int AS lost
      FROM duels d
      JOIN "user" u ON u.id = d.opponent_id
      GROUP BY u.id, u.nickname
      ORDER BY COUNT(*) DESC, u.nickname
      LIMIT 5
    `;

  return rows.map((row) => {
    const total = row.won + row.lost;
    return {
      nickname: row.nickname,
      won: row.won,
      lost: row.lost,
      percent: total > 0 ? (row.won / total) * 100 : 0,
    };
  });
}

async function getTrades(playerId: number) {
  const rows: Array<{ trades: number }> = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS trades
    FROM match_kill_with_trade
    WHERE killer_id = ${playerId} AND is_tradekill = true
  `;
  return rows[0]?.trades ?? 0;
}

async function getGrenadeDamage(playerId: number) {
  const rows: Array<{ damage: number }> = await prisma.$queryRaw`
    SELECT COALESCE(SUM(md.damage_normalized), 0)::int AS damage
    FROM match_damage md
    JOIN weapon w ON w.weapon_id = md.weapon_id
    WHERE md.inflictor_id = ${playerId}
      AND md.inflictor_id <> md.victim_id
      AND w."type" = 'grenade'
  `;
  return rows[0]?.damage ?? 0;
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);

  if (!Number.isInteger(playerId) || playerId <= 0) notFound();

  const user = await prisma.user.findUnique({
    where: { id: playerId },
    select: { id: true, nickname: true, avatar: true, profileId: true },
  });

  if (!user) notFound();

  const [
    totals,
    clutches,
    entry,
    duels,
    trades,
    grenadeDamage,
    matches,
    matchRows,
    mvp,
  ] =
    await Promise.all([
      getTotals(playerId),
      getClutches(playerId),
      getEntryDuels(playerId),
      getDuelOpponents(playerId),
      getTrades(playerId),
      getGrenadeDamage(playerId),
      prisma.matchMember.count({ where: { userId: playerId } }),
      getMatches(playerId),
      user.profileId
        ? prisma.tournament.count({ where: { mvpId: user.profileId } })
        : Promise.resolve(0),
    ]);

  const rounds = totals?.rounds ?? 0;
  const kastPercent =
    totals && totals.kast_total > 0
      ? (totals.kast_rounds / totals.kast_total) * 100
      : 0;

  // Рейтинг считается один раз и здесь: если swing посчитан — по нему,
  // иначе по HLTV 2.0. Ранг при этом всегда из SQL, где рейтинг посчитан
  // по той же запасной формуле для всех сразу — сравнивать игроков между
  // собой можно только по одной шкале.
  const { rating, source: ratingSource } = totals
    ? impactRating({
        kills: totals.kills,
        deaths: totals.deaths,
        assists: totals.assists,
        damage: totals.damage,
        kastRounds: totals.kast_rounds,
        rounds: totals.rounds,
        swing: totals.swing,
      })
    : { rating: 0, source: "hltv2" as const };

  const impact = totals
    ? ratingComponents({
        kills: totals.kills,
        deaths: totals.deaths,
        assists: totals.assists,
        damage: totals.damage,
        kastRounds: totals.kast_rounds,
        rounds: totals.rounds,
      }).impact
    : 0;

  const cards: StatCardData[] = totals
    ? [
        {
          label: "Урон за раунд",
          value: totals.adr.toFixed(1),
          rank: totals.adr_rank,
          outOf: totals.players_ranked,
          details: [
            { n: "Урон", v: String(totals.damage) },
            { n: "Раундов", v: String(totals.rounds) },
          ],
        },
        {
          label: "K/D",
          value: totals.kd.toFixed(2),
          rank: totals.kd_rank,
          outOf: totals.players_ranked,
          details: [
            { n: "Убийств", v: String(totals.kills) },
            { n: "Смертей", v: String(totals.deaths) },
            { n: "Ассистов", v: String(totals.assists) },
          ],
        },
        {
          label: "В голову",
          value: `${(totals.hs_ratio * 100).toFixed(1)}%`,
          rank: totals.hs_rank,
          outOf: totals.players_ranked,
          details: [
            { n: "Хедшотов", v: String(totals.hs_kills) },
            { n: "Убийств", v: String(totals.kills) },
          ],
        },
        {
          label: "KAST",
          value: `${kastPercent.toFixed(1)}%`,
          rank: null,
          outOf: totals.players_ranked,
          details: [
            { n: "Impact", v: impact.toFixed(2) },
            { n: "Мультикиллы", v: String(totals.multi_kills) },
            { n: "Выжил", v: String(totals.survived) },
          ],
        },
      ]
    : [];

  // Swing показываем только когда он есть: у матчей, залитых до появления
  // модели, его нет, а ноль читался бы как «игрок ничего не сделал».
  const swingPer100 =
    totals && totals.swing !== null && rounds > 0
      ? (totals.swing / rounds) * 100
      : null;

  const minis: MiniStatData[] = [
    {
      label: "Размены",
      value: String(trades),
      hint: "убийств, отомстивших за напарника",
    },
    {
      label: "Урон гранатами",
      value: String(grenadeDamage),
    },
    ...(swingPer100 !== null
      ? [
          {
            label: "Swing",
            value: `${swingPer100 >= 0 ? "+" : ""}${swingPer100.toFixed(2)}`,
            hint: "вклад в шансы команды, на 100 раундов",
          },
          {
            label: "Решающие / впустую",
            value: `${totals?.impact_frags ?? 0} / ${totals?.exit_frags ?? 0}`,
            hint: "убийства, менявшие раунд, и в уже проигранном",
          },
        ]
      : [{ label: "Ассистов", value: String(totals?.assists ?? 0) }]),
  ];

  // Рейтинг за матч считается из слагаемых этого матча, а не усредняется
  // из общего: формула нелинейна по раундам, среднее от рейтингов — не рейтинг.
  const playerMatches: PlayerMatchRow[] = matchRows.map((row) => {
    const perMatch = impactRating({
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      damage: row.damage,
      kastRounds: row.kast_rounds,
      rounds: row.rounds,
      swing: row.swing,
    });

    return {
      matchId: row.match_id,
      startedAt: row.started_at,
      mapName: row.map_name,
      teamName: row.team_name,
      teamScore: row.team_score,
      opponentName: row.opponent_name,
      opponentScore: row.opponent_score,
      won: row.is_winner,
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      adr: row.damage / Math.max(row.rounds, 1),
      rating: perMatch.rating,
      ratingSource: perMatch.source,
    };
  });

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-8 sm:px-12 space-y-14">
        <PlayerCard
          user={{
            id: user.id,
            nickname: user.nickname,
            avatar: user.avatar,
            rating,
            ratingRank: totals?.rating_rank ?? null,
            playersRanked: totals?.players_ranked ?? 0,
            ratingSource,
            matches,
            rounds,
            mvp,
            roundsToRank: Math.max(0, MIN_RANKED_ROUNDS - rounds),
          }}
        />

        {/* Игрок есть, а сыгранных раундов нет: матч ещё не разобран или
            вьюшки не пересчитаны после импорта. Раньше в этом случае
            страница схлопывалась в одну строку и теряла даже список
            матчей — теперь остаётся на месте всё, для чего есть данные. */}
        {totals ? (
          <>
            <StatsGrid
              cards={cards}
              entry={entry}
              minis={minis}
              caption={`${rounds} раундов в ${matches} матчах`}
            />

            <Section title="Клатчи" note="выиграно в меньшинстве">
              <ClutchStats data={clutches} />
            </Section>
          </>
        ) : (
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-widest">
            Статистики пока нет — ни один матч этого игрока не разобран
          </p>
        )}

        <DuelMasters duels={duels} />

        <PlayerMatches matches={playerMatches} />
      </div>
    </main>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-4 mb-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
          {title}
        </h2>
        {note && (
          <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
            {"// "}
            {note}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
