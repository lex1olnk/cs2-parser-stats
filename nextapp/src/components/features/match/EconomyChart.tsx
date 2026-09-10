import React from "react";

/**
 * Закупка по раундам: сколько стоило снаряжение каждой команды.
 *
 * Именно стоимость снаряжения, а не оставшиеся деньги — на вопрос «кто
 * в этом раунде был вооружён лучше» отвечает она. Та же величина входит
 * в модель swing как поправка на экономику (cs-parser/swing-model.js).
 *
 * Столбики растут вверх и вниз от общей оси, чтобы эко-раунды и закупы
 * читались как рисунок, а не как два отдельных графика.
 */

export type EconomyRound = {
  number: number;
  buyA: number;
  buyB: number;
  winnerTeamId: string;
};

const MAX_BAR = 64;

export function EconomyChart({
  rounds,
  teamAId,
  teamAName,
  teamBName,
}: {
  rounds: EconomyRound[];
  teamAId: string;
  teamAName: string;
  teamBName: string;
}) {
  if (rounds.length === 0) return null;

  const peak = Math.max(1, ...rounds.map((r) => Math.max(r.buyA, r.buyB)));
  const height = (value: number) => Math.round((value / peak) * MAX_BAR);
  const money = (value: number) => "$" + value.toLocaleString("ru-RU");

  const totalA = rounds.reduce((s, r) => s + r.buyA, 0);
  const totalB = rounds.reduce((s, r) => s + r.buyB, 0);

  return (
    <div className="border border-zinc-900 bg-black p-6 overflow-x-auto">
      <div className="min-w-max">
        <div className="flex gap-1 items-end" style={{ height: MAX_BAR }}>
          {rounds.map((round) => (
            <div
              key={round.number}
              title={`Раунд ${round.number}: ${teamAName} ${money(round.buyA)}`}
              className={`w-7 shrink-0 ${
                round.winnerTeamId === teamAId
                  ? "bg-zinc-300"
                  : "bg-zinc-300/25"
              }`}
              style={{ height: Math.max(1, height(round.buyA)) }}
            />
          ))}
        </div>

        <div className="flex gap-1 my-1">
          {rounds.map((round) => (
            <div
              key={round.number}
              className="w-7 shrink-0 text-center font-mono text-[9px] text-zinc-700"
            >
              {round.number}
            </div>
          ))}
        </div>

        <div className="flex gap-1 items-start" style={{ height: MAX_BAR }}>
          {rounds.map((round) => (
            <div
              key={round.number}
              title={`Раунд ${round.number}: ${teamBName} ${money(round.buyB)}`}
              className={`w-7 shrink-0 ${
                round.winnerTeamId !== teamAId
                  ? "bg-zinc-300"
                  : "bg-zinc-300/25"
              }`}
              style={{ height: Math.max(1, height(round.buyB)) }}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-wrap gap-x-10 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
        <span>
          сверху <span className="text-zinc-300">{teamAName}</span> — всего{" "}
          {money(totalA)}
        </span>
        <span>
          снизу <span className="text-zinc-300">{teamBName}</span> — всего{" "}
          {money(totalB)}
        </span>
        <span>
          <span className="inline-block w-3 h-3 align-middle mr-2 bg-zinc-300" />
          раунд выигран
        </span>
        <span className="text-zinc-700">пик {money(peak)}</span>
      </div>
    </div>
  );
}
