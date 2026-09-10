import Link from "next/link";
import React from "react";

/**
 * Матчи игрока — вход на страницу конкретного матча.
 *
 * До этого связь работала в одну сторону: с матча можно было уйти к игроку,
 * а обратно нет. Здесь же видно, из чего сложился общий рейтинг: одна
 * провальная игра или ровный ряд.
 */

export type PlayerMatchRow = {
  matchId: string;
  startedAt: Date;
  mapName: string | null;
  teamName: string | null;
  teamScore: number | null;
  opponentName: string | null;
  opponentScore: number | null;
  won: boolean | null;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;
  rating: number;
  ratingSource: "swing" | "hltv2";
};

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
});

export function PlayerMatches({ matches }: { matches: PlayerMatchRow[] }) {
  if (matches.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline gap-4 mb-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
          Matches
        </h2>
        <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
          {"// "}
          последние {matches.length}
        </span>
      </div>

      <div className="space-y-1">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            href={`/matches/${match.matchId}`}
            className="group grid grid-cols-12 gap-4 items-center px-5 py-4 border border-zinc-900 bg-black hover:bg-white transition-all duration-300"
          >
            <div className="col-span-2 font-mono text-[10px] text-zinc-600 group-hover:text-black/60">
              {dateFormat.format(match.startedAt)}
            </div>

            <div className="col-span-4 min-w-0">
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-sm font-bold uppercase tracking-tight truncate ${
                    match.won === true
                      ? "text-white group-hover:text-black"
                      : "text-zinc-600 group-hover:text-black/50"
                  }`}
                >
                  {match.opponentName ?? "—"}
                </span>
                {match.teamScore !== null && match.opponentScore !== null && (
                  <span
                    className={`font-black italic text-sm shrink-0 ${
                      match.won
                        ? "text-green-500"
                        : "text-red-500 group-hover:text-red-600"
                    }`}
                  >
                    {match.teamScore}:{match.opponentScore}
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-zinc-700 group-hover:text-black/50 uppercase tracking-widest truncate">
                {match.mapName ?? "—"}
              </div>
            </div>

            <div className="col-span-3 font-mono text-[11px] text-zinc-500 group-hover:text-black/60 tabular-nums">
              {match.kills}–{match.deaths}–{match.assists}
              <span className="ml-3 text-zinc-700 group-hover:text-black/40">
                {match.adr.toFixed(0)} adr
              </span>
            </div>

            <div className="col-span-3 text-right">
              <span
                className={`font-black italic tabular-nums ${
                  match.rating >= 1.15
                    ? "text-green-500"
                    : match.rating < 0.9
                      ? "text-red-500"
                      : "text-white group-hover:text-black"
                }`}
              >
                {match.rating.toFixed(2)}
              </span>
              {match.ratingSource === "hltv2" && (
                <span
                  className="ml-1 font-mono text-[9px] text-zinc-700 group-hover:text-black/40"
                  title="Swing у этого матча не посчитан — рейтинг по HLTV 2.0"
                >
                  ²
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
