import Link from "next/link";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/../prisma/generated/client";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MATCHES_LIMIT = 40;

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
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
      const url = new URL(demoPath);
      return { label: url.hostname, href: demoPath };
    } catch {
      return { label: demoPath, href: null };
    }
  }
  return { label: demoPath, href: null };
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ tournament?: string }>;
}) {
  const { tournament } = await searchParams;
  const tournamentId =
    tournament && UUID_REGEX.test(tournament) ? tournament : null;

  const matchWhere: Prisma.MatchWhereInput = tournamentId
    ? { tournamentId }
    : {};

  const [tournaments, matches, totalMatches, rounds, kills, players, mapGroups] =
    await Promise.all([
      prisma.tournament.findMany({
        select: { id: true, name: true, status: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.match.findMany({
        where: matchWhere,
        orderBy: { startedAt: "desc" },
        take: MATCHES_LIMIT,
        select: {
          id: true,
          startedAt: true,
          demoPath: true,
          status: true,
          type: true,
          tournament: { select: { id: true, name: true } },
          teams: {
            select: { id: true, name: true, score: true, isWinner: true },
            orderBy: { score: "desc" },
          },
          maps: { select: { map: { select: { name: true } } } },
          _count: { select: { rounds: true, kills: true } },
        },
      }),
      prisma.match.count({ where: matchWhere }),
      prisma.round.count({ where: { match: matchWhere } }),
      prisma.matchKill.count({ where: { match: matchWhere } }),
      prisma.matchMember.groupBy({
        by: ["userId"],
        where: { match: matchWhere, userId: { not: null } },
      }),
      prisma.matchMap.groupBy({
        by: ["mapId"],
        where: { match: matchWhere },
        _count: { _all: true },
        orderBy: { _count: { mapId: "desc" } },
        take: 5,
      }),
    ]);

  const mapNames = await prisma.map.findMany({
    where: { id: { in: mapGroups.map((group) => group.mapId) } },
    select: { id: true, name: true },
  });
  const mapNameById = new Map(mapNames.map((map) => [map.id, map.name]));

  const activeTournament = tournamentId
    ? tournaments.find((t) => t.id === tournamentId)
    : null;
  const title = activeTournament?.name ?? "Match_Archive";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-12">
        {/* Заголовок страницы */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase">
              Match_History
            </span>
            <span className="text-zinc-600 font-mono text-[10px] tracking-widest">
              {"// PARSED_DEMO_ENTRIES"}
            </span>
          </div>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase">
            {title.split(/[\s_]+/).map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={i % 2 === 0 ? "text-white" : "text-zinc-800"}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
        </div>

        {/* Фильтр по турниру */}
        <div className="flex flex-wrap items-center gap-2 mb-12 font-mono text-[10px] uppercase tracking-widest">
          <FilterLink href="/matches" active={!tournamentId} label="All" />
          {tournaments.map((t) => (
            <FilterLink
              key={t.id}
              href={`/matches?tournament=${t.id}`}
              active={t.id === tournamentId}
              label={t.name}
            />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Левая колонка: список матчей */}
          <div className="col-span-12 lg:col-span-8 space-y-1">
            {matches.length === 0 ? (
              <p className="font-mono text-zinc-600 text-sm uppercase tracking-widest">
                No_Match_Data
              </p>
            ) : (
              matches.map((match) => {
                const source = describeSource(match.demoPath);
                const mapLabel =
                  match.maps.map((m) => m.map.name).join(" / ") || "—";

                return (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="group grid grid-cols-12 gap-4 items-center px-6 py-5 border border-zinc-900 bg-black hover:bg-white transition-all duration-300"
                  >
                    <div className="col-span-2 font-mono text-[10px] text-zinc-600 group-hover:text-black/60 leading-relaxed">
                      <div>{dateFormat.format(match.startedAt)}</div>
                      <div>{timeFormat.format(match.startedAt)}</div>
                    </div>

                    <div className="col-span-6">
                      <div className="flex items-baseline gap-3">
                        {match.teams.length === 0 ? (
                          <span className="text-zinc-700 font-mono text-xs uppercase">
                            No_Teams
                          </span>
                        ) : (
                          match.teams.map((team, i) => (
                            <span
                              key={team.id}
                              className="flex items-baseline gap-3"
                            >
                              {i > 0 && (
                                <span className="text-zinc-800 group-hover:text-black/30 text-sm">
                                  vs
                                </span>
                              )}
                              <span
                                className={`text-lg font-bold uppercase tracking-tighter ${
                                  team.isWinner
                                    ? "text-white group-hover:text-black"
                                    : "text-zinc-600 group-hover:text-black/50"
                                }`}
                              >
                                {team.name}
                                <span className="ml-2 font-black italic">
                                  {team.score}
                                </span>
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-zinc-700 group-hover:text-black/50 uppercase tracking-widest">
                        {mapLabel}
                        {match.tournament ? ` // ${match.tournament.name}` : ""}
                      </div>
                    </div>

                    <div className="col-span-2 text-center font-mono text-[10px] text-zinc-600 group-hover:text-black/60">
                      <div>{match._count.rounds} rounds</div>
                      <div>{match._count.kills} kills</div>
                    </div>

                    <div className="col-span-2 text-right font-mono text-[10px] text-zinc-700 group-hover:text-black/60 truncate">
                      <span title={source.label}>{source.label}</span>
                    </div>
                  </Link>
                );
              })
            )}

            {totalMatches > matches.length && (
              <p className="pt-6 font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
                Showing {matches.length} of {totalMatches}
              </p>
            )}
          </div>

          {/* Правая колонка: сводка по выборке */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="border border-zinc-900 p-6 bg-zinc-900/5 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">
                {activeTournament ? "Event_Details" : "Archive_Details"}
              </h3>
              <div className="space-y-4 font-mono text-[11px]">
                {activeTournament && (
                  <SummaryRow
                    label="STATUS"
                    value={`[ ${activeTournament.status.toUpperCase()} ]`}
                    accent
                  />
                )}
                <SummaryRow label="MATCHES" value={String(totalMatches)} />
                <SummaryRow label="ROUNDS" value={String(rounds)} />
                <SummaryRow label="KILLS" value={String(kills)} />
                <SummaryRow label="PLAYERS" value={String(players.length)} />
              </div>
            </div>

            <div className="border border-zinc-900 p-6 bg-zinc-900/5">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">
                Maps
              </h3>
              {mapGroups.length === 0 ? (
                <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
                  No_Data
                </p>
              ) : (
                <div className="space-y-4 font-mono text-[11px]">
                  {mapGroups.map((group) => (
                    <SummaryRow
                      key={group.mapId}
                      label={(
                        mapNameById.get(group.mapId) ?? `MAP_${group.mapId}`
                      ).toUpperCase()}
                      value={String(group._count._all)}
                    />
                  ))}
                </div>
              )}
            </div>

            {activeTournament && (
              <Link
                href={`/tournament/players?tournament=${activeTournament.id}`}
                className="block border border-dashed border-zinc-800 py-6 text-center italic text-zinc-600 hover:text-white hover:border-white text-xs uppercase tracking-widest transition-colors"
              >
                Top_Performers →
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-1.5 border transition-colors ${
        active
          ? "bg-white text-black border-white font-black"
          : "border-zinc-800 text-zinc-500 hover:border-white hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between border-b border-zinc-900 pb-2 gap-4">
      <span className="text-zinc-600 shrink-0">{label}:</span>
      <span className={accent ? "text-green-500" : "text-white"}>{value}</span>
    </div>
  );
}
