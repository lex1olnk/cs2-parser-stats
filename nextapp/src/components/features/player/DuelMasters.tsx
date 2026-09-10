"use client";
import React from "react";
import { motion } from "framer-motion";

export type DuelStat = {
  /** Ник соперника. */
  nickname: string;
  /** Доля выигранных дуэлей против него, 0..100. */
  percent: number;
  won: number;
  lost: number;
};

/**
 * Частые соперники и счёт личных встреч.
 *
 * Цвет здесь означает результат, а не порядок: раньше ники раскрашивались
 * радугой по индексу, и красный у первого читался как «плохо», хотя значил
 * лишь «он первый в списке».
 */
export function DuelMasters({ duels }: { duels: DuelStat[] }) {
  if (duels.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline gap-4 mb-5">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
          Личные встречи
        </h2>
        <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
          {"// "}с кем чаще всего пересекались
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {duels.map((duel, i) => {
          const total = duel.won + duel.lost;
          const ahead = duel.won > duel.lost;
          const even = duel.won === duel.lost;

          return (
            <motion.div
              key={duel.nickname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="border border-zinc-900 bg-zinc-900/5 p-4"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 truncate"
                title={duel.nickname}
              >
                {duel.nickname}
              </p>
              <p
                className={`mt-2 text-3xl font-black italic tracking-tighter tabular-nums ${
                  even
                    ? "text-zinc-300"
                    : ahead
                      ? "text-green-500"
                      : "text-red-500"
                }`}
              >
                {duel.percent.toFixed(0)}%
              </p>

              {/* Полоса делит счёт встреч: слева выигранные, справа нет. */}
              <div className="mt-3 flex h-1.5 bg-zinc-900">
                <div
                  className={even ? "bg-zinc-500" : ahead ? "bg-green-500" : "bg-red-500"}
                  style={{ width: `${total > 0 ? (duel.won / total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-[10px] text-zinc-700 tabular-nums">
                {duel.won}–{duel.lost}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
