"use client";
import { motion } from "framer-motion";

export type StatCardData = {
  label: string;
  value: string;
  /** Место игрока по этому показателю; null — не хватает раундов. */
  rank: number | null;
  outOf: number;
  details: { n: string; v: string }[];
};

export type MiniStatData = {
  label: string;
  value: string;
  /** Короткое пояснение под значением — что это вообще такое. */
  hint?: string;
};

export type EntryData = {
  /** Доля выигранных первых дуэлей раунда, 0..100. */
  percent: number;
  won: number;
  lost: number;
};

// Длина окружности индикатора entry: 2*PI*62 ≈ 390.
const RING_LENGTH = 390;

export function StatsGrid({
  cards,
  entry,
  minis,
  caption,
}: {
  cards: StatCardData[];
  entry: EntryData;
  minis: MiniStatData[];
  caption: string;
}) {
  const entryTotal = entry.won + entry.lost;

  return (
    <section className="space-y-10">
      <div className="flex items-baseline gap-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
          Main_Stats
        </h2>
        <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
          {"// "}
          {caption}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="border border-zinc-900 p-5 bg-zinc-900/5 group hover:bg-white transition-colors duration-300"
          >
            <div className="flex justify-between items-start gap-3 border-b border-zinc-800 group-hover:border-zinc-300 pb-3 mb-4">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase text-zinc-600 group-hover:text-zinc-500 tracking-widest">
                  {stat.label}
                </p>
                <p className="text-3xl font-black italic tracking-tighter group-hover:text-black tabular-nums">
                  {stat.value}
                </p>
              </div>
              {/* Место показываем только тем, кто в рейтинге: «#1 из 2»
                  по паре раундов вводит в заблуждение сильнее, чем прочерк. */}
              {stat.rank !== null && (
                <span className="shrink-0 font-mono text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 group-hover:bg-black group-hover:text-white">
                  {stat.rank}/{stat.outOf}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              {stat.details.map((d) => (
                <div
                  key={d.n}
                  className="flex justify-between gap-3 font-mono text-[10px] uppercase tracking-tight"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-500">
                    {d.n}
                  </span>
                  <span className="text-zinc-400 group-hover:text-black tabular-nums">
                    {d.v}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 border-t border-zinc-900">
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-32 h-32 flex items-center justify-center border border-zinc-900 rounded-full relative">
            <svg className="absolute inset-0 -rotate-90 w-full h-full">
              <circle
                cx="64"
                cy="64"
                r="62"
                fill="none"
                stroke="#18181b"
                strokeWidth="1"
              />
              {entryTotal > 0 && (
                <motion.circle
                  cx="64"
                  cy="64"
                  r="62"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray={RING_LENGTH}
                  initial={{ strokeDashoffset: RING_LENGTH }}
                  animate={{
                    strokeDashoffset:
                      RING_LENGTH - (RING_LENGTH * entry.percent) / 100,
                  }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                />
              )}
            </svg>
            <div className="text-center px-2">
              {/* Ноль процентов и «ни одной дуэли» — разные вещи. */}
              {entryTotal > 0 ? (
                <span className="text-2xl font-black italic block tabular-nums">
                  {entry.percent.toFixed(0)}%
                </span>
              ) : (
                <span className="text-lg font-black italic block text-zinc-700">
                  —
                </span>
              )}
              <span className="font-mono text-[8px] uppercase text-zinc-600 tracking-widest">
                Первые дуэли
              </span>
            </div>
          </div>
          <p className="font-mono text-[9px] text-zinc-700 mt-4 uppercase tracking-widest">
            {entryTotal > 0
              ? `${entry.won} выиграно / ${entry.lost} проиграно`
              : "нет данных"}
          </p>
        </div>

        {/* Просто сетка значений. Раньше между ними вклинивался
            декоративный элемент, занимавший колонку данных, и разметка
            держалась только на том, что показателей ровно четыре. */}
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {minis.map((mini) => (
            <div key={mini.label} className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 bg-zinc-600 rotate-45 shrink-0" />
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase text-zinc-600 tracking-[0.2em]">
                  {mini.label}
                </p>
                <p className="text-xl font-black italic leading-tight text-zinc-200 tabular-nums">
                  {mini.value}
                </p>
                {mini.hint && (
                  <p className="font-mono text-[9px] text-zinc-700 leading-snug mt-0.5">
                    {mini.hint}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
