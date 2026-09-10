import React from "react";

/**
 * Лента раундов: кто выиграл, за какую сторону и с каким счётом.
 *
 * Сторона важнее, чем кажется: она показывает, где произошёл переход
 * половин, и сразу видно, кому какая сторона далась. Считать её из номера
 * раунда нельзя — она приходит из самих раундов (см. комментарий на странице).
 */

const T_SIDE = 2;

export type TimelineRound = {
  number: number;
  winnerTeamId: string;
  winnerSide: number;
  reason: string;
  scoreA: number;
  scoreB: number;
  sideA: number | null;
  sideB: number | null;
};

export function RoundTimeline({
  rounds,
  teamAId,
  teamAName,
  teamBName,
}: {
  rounds: TimelineRound[];
  teamAId: string;
  teamAName: string;
  teamBName: string;
}) {
  if (rounds.length === 0) {
    return (
      <p className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
        No_Round_Data
      </p>
    );
  }

  // Место, где команды поменялись сторонами: рисуем как разрыв в ленте.
  const swaps = new Set<number>();
  rounds.forEach((round, i) => {
    if (i > 0 && round.sideA !== rounds[i - 1].sideA) swaps.add(round.number);
  });

  return (
    <div className="border border-zinc-900 bg-black p-6 overflow-x-auto">
      <div className="min-w-max space-y-3">
        <TimelineRow
          label={teamAName}
          rounds={rounds}
          isWinner={(r) => r.winnerTeamId === teamAId}
          sideOf={(r) => r.sideA}
          swaps={swaps}
        />

        <div className="flex gap-1">
          {rounds.map((round) => (
            <div
              key={round.number}
              className={`w-7 shrink-0 text-center font-mono text-[9px] text-zinc-700 ${
                swaps.has(round.number) ? "ml-4" : ""
              }`}
            >
              {round.number}
            </div>
          ))}
        </div>

        <TimelineRow
          label={teamBName}
          rounds={rounds}
          isWinner={(r) => r.winnerTeamId !== teamAId}
          sideOf={(r) => r.sideB}
          swaps={swaps}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        <span>
          <span className="inline-block w-3 h-3 align-middle mr-2 bg-amber-500/80" />
          T
        </span>
        <span>
          <span className="inline-block w-3 h-3 align-middle mr-2 bg-sky-500/80" />
          CT
        </span>
        <span>
          <span className="inline-block w-3 h-3 align-middle mr-2 border border-zinc-800" />
          раунд проигран
        </span>
        <span className="text-zinc-700">разрыв — смена сторон</span>
      </div>
    </div>
  );
}

function TimelineRow({
  label,
  rounds,
  isWinner,
  sideOf,
  swaps,
}: {
  label: string;
  rounds: TimelineRound[];
  isWinner: (round: TimelineRound) => boolean;
  sideOf: (round: TimelineRound) => number | null;
  swaps: Set<number>;
}) {
  const won = rounds.filter(isWinner).length;

  return (
    <div className="flex items-center gap-4">
      <div className="w-40 shrink-0 text-right">
        <div className="text-sm font-bold uppercase tracking-tight truncate text-zinc-300">
          {label}
        </div>
        <div className="font-mono text-[10px] text-zinc-600">{won}</div>
      </div>

      <div className="flex gap-1">
        {rounds.map((round) => {
          const side = sideOf(round);
          const winner = isWinner(round);
          const fill = winner
            ? side === T_SIDE
              ? "bg-amber-500/80"
              : "bg-sky-500/80"
            : "border border-zinc-800";

          return (
            <div
              key={round.number}
              title={`Раунд ${round.number}: ${round.reason}, счёт ${round.scoreA}:${round.scoreB}`}
              className={`w-7 h-7 shrink-0 ${fill} ${
                swaps.has(round.number) ? "ml-4" : ""
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
