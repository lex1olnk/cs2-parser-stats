import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { impactRating } from "@/lib/rating";
import { RoundTimeline, type TimelineRound } from "@/components/features/match/RoundTimeline";
import { Scoreboard, type ScoreboardRow } from "@/components/features/match/Scoreboard";
import { EconomyChart, type EconomyRound } from "@/components/features/match/EconomyChart";

// Страница одного матча: счёт, ход по раундам, таблица игроков и закупка.
//
// Стороны команд берутся из самих раундов, а не считаются из номера раунда.
// У каждого раунда записаны и победившая команда, и сторона, за которую она
// играла, — этого достаточно, чтобы разложить обе команды по сторонам в любом
// раунде. Арифметика вида «до двенадцатого одни, после — другие» здесь не
// работает: у платформ разная нумерация, а овертаймы ломают её окончательно
// (см. фазу 11 в plan.md).

const T_SIDE = 2;
const CT_SIDE = 3;

// id матча идёт прямо в запрос к колонке типа uuid, и Postgres падает
// на разборе, если это не uuid. Без проверки /matches/abc отдаёт 500
// вместо 404 — ошибку сервера там, где просто нет такой страницы.
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
});

// demoPath хранит либо исходную ссылку на матч, либо "local:<имя файла>"
// для демок, положенных в shared-demos руками.
function describeSource(demoPath: string) {
  if (demoPath.startsWith("local:")) {
    return { label: demoPath.slice("local:".length), href: null };
  }
  if (demoPath.startsWith("http")) {
    try {
      return { label: new URL(demoPath).hostname, href: demoPath };
    } catch {
      return { label: demoPath, href: null };
    }
  }
  return { label: demoPath, href: null };
}

/** Как закончился раунд. Названия приходят из демки в снейк-кейсе. */
const WIN_REASON_LABEL: Record<string, string> = {
  t_killed: "Все T убиты",
  ct_killed: "Все CT убиты",
  bomb_defused: "Бомба разминирована",
  target_bombed: "Бомба взорвалась",
  target_saved: "Время вышло",
  hostages_rescued: "Заложники спасены",
  hostages_not_rescued: "Заложники не спасены",
};

type ScoreRow = {
  player_id: number;
  nickname: string;
  avatar: string | null;
  steam_id: string;
  team_id: string | null;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  flash_assists: number;
  damage: number;
  hs_kills: number;
  kast_rounds: number;
  swing: number | null;
  exit_frags: number | null;
  impact_frags: number | null;
};

/**
 * Таблица игроков за матч. Все слагаемые уже посчитаны материализованными
 * вьюшками, здесь они только сводятся по игроку.
 *
 * Раунды берутся из `rounds_played_per_match`, а не из числа раундов матча:
 * игрок мог подключиться позже или уйти, и делить его убийства на чужие
 * раунды нельзя.
 */
async function getScoreboard(matchId: string) {
  return prisma.$queryRaw<ScoreRow[]>`
    SELECT u.id                                  AS player_id,
           u.nickname,
           u.avatar,
           u.steam_id,
           mm.match_team_id                      AS team_id,
           COALESCE(rp.rounds, 0)::int           AS rounds,
           COALESCE(k.kills, 0)::int             AS kills,
           COALESCE(d.deaths, 0)::int            AS deaths,
           COALESCE(a.assists, 0)::int           AS assists,
           COALESCE(fa.flash_assists, 0)::int    AS flash_assists,
           COALESCE(dmg.damage, 0)::int          AS damage,
           COALESCE(k.hs_kills, 0)::int          AS hs_kills,
           COALESCE(ka.kast_rounds, 0)::int      AS kast_rounds,
           sw.swing,
           sw.exit_frags::int                    AS exit_frags,
           sw.impact_frags::int                  AS impact_frags
    FROM match_member mm
    JOIN "user" u ON u.id = mm.user_id
    LEFT JOIN rounds_played_per_match rp
           ON rp.player_id = u.id AND rp.match_id = mm.match_id
    LEFT JOIN kill_stats_per_match k
           ON k.player_id = u.id AND k.match_id = mm.match_id
    LEFT JOIN death_stats_per_match d
           ON d.player_id = u.id AND d.match_id = mm.match_id
    LEFT JOIN assist_stats_per_match a
           ON a.player_id = u.id AND a.match_id = mm.match_id
    LEFT JOIN flash_assist_stats_per_match fa
           ON fa.player_id = u.id AND fa.match_id = mm.match_id
    LEFT JOIN damage_stats_per_match dmg
           ON dmg.player_id = u.id AND dmg.match_id = mm.match_id
    LEFT JOIN kast_per_match ka
           ON ka.player_id = u.id AND ka.match_id = mm.match_id
    LEFT JOIN player_swing_per_match sw
           ON sw.player_id = u.id AND sw.match_id = mm.match_id
    WHERE mm.match_id = ${matchId}::uuid
      AND mm.user_id IS NOT NULL
  `;
}

type EconomyRow = {
  round_number: number;
  team_num: number;
  buy: number;
};

/**
 * Закупка по раундам. Считается по инвентарю на выходе из закупки, а не по
 * оставшимся деньгам: «на сколько команда вооружена» отвечает на вопрос,
 * а «сколько денег осталось» — нет.
 *
 * `team_num` здесь — сторона в этом раунде, поэтому в команды это
 * раскладывается снаружи, по сторонам из раундов.
 */
async function getEconomy(matchId: string) {
  return prisma.$queryRaw<EconomyRow[]>`
    SELECT r.round_number,
           e.team_num,
           COALESCE(SUM(w.cost), 0)::int AS buy
    FROM match_player_economy e
    JOIN round r ON r.id = e.round_id
    LEFT JOIN match_inventory i ON i.economy_snapshot_id = e.id
    LEFT JOIN weapon w ON w.weapon_id = i.weapon_id
    WHERE e.match_id = ${matchId}::uuid
    GROUP BY r.round_number, e.team_num
    ORDER BY r.round_number, e.team_num
  `;
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      id: true,
      startedAt: true,
      // finishedAt здесь намеренно не берётся: парсер пишет в него ту же
      // отметку, что и в startedAt, так что длительности матча в базе нет.
      // Отметки времени раундов тоже синтетические — у них startedAt идёт
      // назад. Настоящий там только tick.
      status: true,
      type: true,
      demoPath: true,
      tournament: { select: { id: true, name: true } },
      maps: { select: { map: { select: { name: true } } } },
      teams: {
        select: { id: true, name: true, score: true, isWinner: true },
        orderBy: { score: "desc" },
      },
      rounds: {
        select: {
          roundNumber: true,
          winReason: true,
          winTeamNum: true,
          winMatchTeamId: true,
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });

  if (!match) notFound();

  const [scoreboard, economy] = await Promise.all([
    getScoreboard(match.id),
    getEconomy(match.id),
  ]);

  const teamById = new Map(match.teams.map((t) => [t.id, t]));
  const [teamA, teamB] = match.teams;

  // Сторона каждой команды в каждом раунде. Победившая команда играла
  // за winTeamNum, вторая — за противоположную сторону.
  const sideByRound = new Map<number, Map<string, number>>();
  match.rounds.forEach((round) => {
    const sides = new Map<string, number>();
    const loserSide = round.winTeamNum === CT_SIDE ? T_SIDE : CT_SIDE;
    match.teams.forEach((team) => {
      sides.set(
        team.id,
        team.id === round.winMatchTeamId ? round.winTeamNum : loserSide,
      );
    });
    sideByRound.set(round.roundNumber, sides);
  });

  // Счёт нарастающим итогом — чтобы в ленте раундов был виден ход матча.
  const running = new Map<string, number>(match.teams.map((t) => [t.id, 0]));
  const timeline: TimelineRound[] = match.rounds.map((round) => {
    const winner = teamById.get(round.winMatchTeamId);
    if (winner) running.set(winner.id, (running.get(winner.id) ?? 0) + 1);
    const sides = sideByRound.get(round.roundNumber);
    return {
      number: round.roundNumber + 1,
      winnerTeamId: round.winMatchTeamId,
      winnerSide: round.winTeamNum,
      reason: WIN_REASON_LABEL[round.winReason] ?? round.winReason,
      scoreA: running.get(teamA?.id ?? "") ?? 0,
      scoreB: running.get(teamB?.id ?? "") ?? 0,
      sideA: sides?.get(teamA?.id ?? "") ?? null,
      sideB: sides?.get(teamB?.id ?? "") ?? null,
    };
  });

  const rows: ScoreboardRow[] = scoreboard.map((row) => {
    const rounds = Math.max(row.rounds, 1);
    const { rating, source } = impactRating({
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      damage: row.damage,
      kastRounds: row.kast_rounds,
      rounds: row.rounds,
      swing: row.swing,
    });
    return {
      playerId: row.player_id,
      nickname: row.nickname,
      avatar: row.avatar,
      teamId: row.team_id,
      rounds: row.rounds,
      kills: row.kills,
      deaths: row.deaths,
      assists: row.assists,
      flashAssists: row.flash_assists,
      adr: row.damage / rounds,
      hsPercent: row.kills > 0 ? (row.hs_kills / row.kills) * 100 : 0,
      kast: (row.kast_rounds / rounds) * 100,
      rating,
      ratingSource: source,
      swingPer100: row.swing === null ? null : (row.swing / rounds) * 100,
      exitFrags: row.exit_frags,
      impactFrags: row.impact_frags,
    };
  });

  // Экономика есть не у всех матчей: у залитых до исправления снапшота она
  // сдвинута на раунд, и первого раунда в ней просто нет. Показывать такой
  // график молча — значит показывать неправду, поэтому проверяем покрытие.
  const economyRounds = new Set(economy.map((e) => e.round_number));
  const firstRound = match.rounds[0]?.roundNumber;
  const economyComplete =
    economy.length > 0 &&
    firstRound !== undefined &&
    economyRounds.has(firstRound) &&
    economyRounds.size === match.rounds.length;

  const economyData: EconomyRound[] = economyComplete
    ? match.rounds.map((round) => {
        const sides = sideByRound.get(round.roundNumber);
        const bySide = new Map(
          economy
            .filter((e) => e.round_number === round.roundNumber)
            .map((e) => [e.team_num, e.buy]),
        );
        return {
          number: round.roundNumber + 1,
          buyA: bySide.get(sides?.get(teamA?.id ?? "") ?? -1) ?? 0,
          buyB: bySide.get(sides?.get(teamB?.id ?? "") ?? -1) ?? 0,
          winnerTeamId: round.winMatchTeamId,
        };
      })
    : [];

  const mapLabel = match.maps.map((m) => m.map.name).join(" / ") || "—";
  const hasSwing = rows.some((r) => r.swingPer100 !== null);
  const source = describeSource(match.demoPath);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-12">
        <Link
          href="/matches"
          className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
        >
          ← Match_Archive
        </Link>

        {/* Счёт */}
        <div className="mt-6 mb-12 border border-zinc-900 bg-black px-10 py-10">
          <div className="flex items-center gap-4 mb-6 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            <span>{dateFormat.format(match.startedAt)}</span>
            <span>{timeFormat.format(match.startedAt)}</span>
            <span className="text-zinc-800">{"//"}</span>
            <span className="text-zinc-400">{mapLabel}</span>
            {match.tournament && (
              <>
                <span className="text-zinc-800">{"//"}</span>
                <Link
                  href={`/matches?tournament=${match.tournament.id}`}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {match.tournament.name}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-8">
            <TeamName team={teamA} align="left" />
            <div className="flex items-baseline gap-6 shrink-0">
              <span
                className={`text-7xl font-black italic tracking-tighter ${
                  teamA?.isWinner ? "text-white" : "text-zinc-700"
                }`}
              >
                {teamA?.score ?? 0}
              </span>
              <span className="text-zinc-800 text-3xl font-black">:</span>
              <span
                className={`text-7xl font-black italic tracking-tighter ${
                  teamB?.isWinner ? "text-white" : "text-zinc-700"
                }`}
              >
                {teamB?.score ?? 0}
              </span>
            </div>
            <TeamName team={teamB} align="right" />
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            <span>{match.type}</span>
            <span>{match.status}</span>
            <span className="text-zinc-700">
              источник:{" "}
              {source.href ? (
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-500 hover:text-white underline underline-offset-2 transition-colors"
                >
                  {source.label}
                </a>
              ) : (
                source.label
              )}
            </span>
          </div>
        </div>

        {/* Ход матча */}
        <Section title="Round_Flow" note={`${match.rounds.length} раундов`}>
          <RoundTimeline
            rounds={timeline}
            teamAId={teamA?.id ?? ""}
            teamAName={teamA?.name ?? "—"}
            teamBName={teamB?.name ?? "—"}
          />
        </Section>

        {/* Таблица игроков */}
        <Section
          title="Scoreboard"
          note={
            hasSwing
              ? "рейтинг по swing"
              : "рейтинг HLTV 2.0 — swing у этого матча не посчитан"
          }
        >
          <div className="space-y-8">
            {match.teams.map((team) => (
              <Scoreboard
                key={team.id}
                teamName={team.name}
                isWinner={team.isWinner}
                rows={rows.filter((r) => r.teamId === team.id)}
                showSwing={hasSwing}
              />
            ))}
            {rows.some((r) => r.teamId === null) && (
              <Scoreboard
                teamName="Вне команд"
                isWinner={false}
                rows={rows.filter((r) => r.teamId === null)}
                showSwing={hasSwing}
              />
            )}
          </div>
        </Section>

        {/* Закупка */}
        <Section
          title="Economy"
          note={economyComplete ? "стоимость закупки по раундам" : undefined}
        >
          {economyComplete ? (
            <EconomyChart
              rounds={economyData}
              teamAId={teamA?.id ?? ""}
              teamAName={teamA?.name ?? "—"}
              teamBName={teamB?.name ?? "—"}
            />
          ) : (
            <p className="font-mono text-[11px] text-zinc-600 leading-relaxed max-w-2xl">
              {economy.length === 0
                ? "Для этого матча закупка не записана."
                : `Закупка записана не для всех раундов (${economyRounds.size} из ${match.rounds.length}), поэтому график не строится: привязка к раундам сдвинута. Лечится переимпортом матча.`}
            </p>
          )}
        </Section>
      </div>
    </main>
  );
}

function TeamName({
  team,
  align,
}: {
  team?: { name: string; isWinner: boolean };
  align: "left" | "right";
}) {
  return (
    <div className={`flex-1 min-w-0 ${align === "right" ? "text-right" : ""}`}>
      <div
        className={`text-4xl font-black uppercase tracking-tighter truncate ${
          team?.isWinner ? "text-white" : "text-zinc-600"
        }`}
      >
        {team?.name ?? "—"}
      </div>
      {team?.isWinner && (
        <div className="mt-2 font-mono text-[10px] uppercase tracking-widest text-green-500">
          Winner
        </div>
      )}
    </div>
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
    <section className="mb-14">
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
