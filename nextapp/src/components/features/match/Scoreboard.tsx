import Link from "next/link";
import React from "react";

/**
 * Таблица игроков одной команды за матч.
 *
 * Колонки со swing показываются только там, где он посчитан: у матчей,
 * залитых до появления модели, его нет, и пустые столбцы вводили бы
 * в заблуждение сильнее, чем их отсутствие.
 */

export type ScoreboardRow = {
  playerId: number;
  nickname: string;
  avatar: string | null;
  teamId: string | null;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
  flashAssists: number;
  adr: number;
  hsPercent: number;
  kast: number;
  rating: number;
  ratingSource: "swing" | "hltv2";
  swingPer100: number | null;
  exitFrags: number | null;
  impactFrags: number | null;
};

export function Scoreboard({
  teamName,
  isWinner,
  rows,
  showSwing,
}: {
  teamName: string;
  isWinner: boolean;
  rows: ScoreboardRow[];
  showSwing: boolean;
}) {
  if (rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => b.rating - a.rating);

  return (
    <div className="border border-zinc-900 bg-black">
      <div className="flex items-baseline gap-3 px-6 py-4 border-b border-zinc-900">
        <h3
          className={`text-xl font-black uppercase tracking-tighter ${
            isWinner ? "text-white" : "text-zinc-500"
          }`}
        >
          {teamName}
        </h3>
        {isWinner && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-green-500">
            Winner
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-max text-sm">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              <Th align="left">Игрок</Th>
              <Th>K</Th>
              <Th>D</Th>
              <Th>A</Th>
              <Th title="Ассисты флешкой — FACEIT считает их отдельно от обычных">
                FA
              </Th>
              <Th>ADR</Th>
              <Th>HS%</Th>
              <Th>KAST</Th>
              {showSwing && (
                <>
                  <Th title="Насколько игрок сдвинул шансы своей команды, пунктов на 100 раундов">
                    Swing
                  </Th>
                  <Th title="Убийства, заметно двинувшие шанс на победу">
                    Impact
                  </Th>
                  <Th title="Убийства в уже проигранном раунде">Exit</Th>
                </>
              )}
              <Th>Рейтинг</Th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.playerId}
                className="border-t border-zinc-900/70 hover:bg-zinc-900/40 transition-colors"
              >
                <td className="px-6 py-3">
                  <Link
                    href={`/player/${row.playerId}`}
                    className="font-bold hover:text-white text-zinc-200 transition-colors"
                  >
                    {row.nickname}
                  </Link>
                  <span className="ml-3 font-mono text-[10px] text-zinc-700">
                    {row.rounds} р.
                  </span>
                </td>
                <Td>{row.kills}</Td>
                <Td>{row.deaths}</Td>
                <Td>{row.assists}</Td>
                <Td dim>{row.flashAssists}</Td>
                <Td>{row.adr.toFixed(1)}</Td>
                <Td>{row.hsPercent.toFixed(0)}%</Td>
                <Td>{row.kast.toFixed(0)}%</Td>
                {showSwing && (
                  <>
                    <Td>
                      {row.swingPer100 === null ? (
                        <span className="text-zinc-700">—</span>
                      ) : (
                        <span
                          className={
                            row.swingPer100 >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {row.swingPer100 >= 0 ? "+" : ""}
                          {row.swingPer100.toFixed(2)}
                        </span>
                      )}
                    </Td>
                    <Td dim>{row.impactFrags ?? "—"}</Td>
                    <Td dim>{row.exitFrags ?? "—"}</Td>
                  </>
                )}
                <td className="px-4 py-3 text-right">
                  <span
                    className={`font-black italic tabular-nums ${
                      row.rating >= 1.15
                        ? "text-green-500"
                        : row.rating < 0.9
                          ? "text-red-500"
                          : "text-white"
                    }`}
                  >
                    {row.rating.toFixed(2)}
                  </span>
                  {row.ratingSource === "hltv2" && (
                    <span
                      className="ml-1 font-mono text-[9px] text-zinc-700"
                      title="Swing у этого матча не посчитан — рейтинг по HLTV 2.0"
                    >
                      ²
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "right",
  title,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  title?: string;
}) {
  return (
    <th
      title={title}
      className={`px-4 py-3 font-normal ${
        align === "left" ? "text-left pl-6" : "text-right"
      } ${title ? "cursor-help" : ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  dim,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-right tabular-nums ${
        dim ? "text-zinc-600" : "text-zinc-300"
      }`}
    >
      {children}
    </td>
  );
}
