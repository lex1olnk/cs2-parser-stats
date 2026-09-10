"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export type PlayerCardData = {
  id: number;
  nickname: string;
  avatar: string | null;
  rating: number;
  /** null — игрок ещё не набрал раундов для попадания в рейтинг. */
  ratingRank: number | null;
  playersRanked: number;
  /** Откуда взялся рейтинг: из swing или из запасной формулы HLTV 2.0. */
  ratingSource: "swing" | "hltv2";
  matches: number;
  rounds: number;
  mvp: number;
  /** Сколько раундов не хватает до попадания в рейтинг. */
  roundsToRank: number;
};

/**
 * Шкала полосы под рейтинг. Ноль слева, 2.0 справа, и 1.00 отмечена
 * засечкой: без неё белая полоса — просто украшение, по которому нельзя
 * понять, хорошо это или плохо. Единица — примерно средний игрок,
 * и именно относительно неё рейтинг читается.
 */
const RATING_SCALE = 2;
const MARKS = [0.5, 1, 1.5];

export function PlayerCard({ user }: { user: PlayerCardData }) {
  // Ни одного разобранного раунда — рейтинга нет. Ноль на его месте
  // читался бы как «играет отвратительно», а это разные вещи.
  const hasRating = user.rounds > 0;
  const barWidth = Math.min(
    100,
    Math.max(0, (user.rating / RATING_SCALE) * 100),
  );

  return (
    <section className="relative border border-zinc-900 bg-zinc-900/5 p-8 sm:p-10">
      <div className="absolute -top-px -left-px w-4 h-4 border-t border-l border-zinc-600" />
      <div className="absolute -bottom-px -right-px w-4 h-4 border-b border-r border-zinc-600" />

      <div className="flex flex-wrap items-start gap-8 justify-between">
        <div className="flex gap-6 min-w-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.nickname}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full shrink-0 bg-zinc-900 border border-zinc-800" />
          )}
          <div className="min-w-0">
            <p className="font-mono text-[10px] text-zinc-600 tracking-widest uppercase mb-1">
              Player #{user.id}
            </p>
            <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter truncate">
              {user.nickname}
            </h1>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
              {user.matches} матчей {"// "} {user.rounds} раундов
              {user.mvp > 0 && ` // ${user.mvp} MVP`}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
            Рейтинг
          </p>
          <p className="text-5xl font-black italic tracking-tighter tabular-nums">
            {hasRating ? user.rating.toFixed(2) : "—"}
          </p>
          {hasRating && (
            <>
              <p className="mt-1 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                {user.ratingRank === null
                  ? `ещё ${user.roundsToRank} раундов до рейтинга`
                  : `${user.ratingRank} место из ${user.playersRanked}`}
              </p>
              <p className="mt-1 font-mono text-[10px] text-zinc-700 uppercase tracking-widest">
                {user.ratingSource === "swing"
                  ? "по вкладу в раунды"
                  : "HLTV 2.0 — swing не посчитан"}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Полоса со шкалой: засечки на 0.5 / 1.0 / 1.5 дают точку отсчёта. */}
      <div className="mt-10" hidden={!hasRating}>
        <div className="relative h-5 border border-zinc-900 p-px">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barWidth}%` }}
            transition={{ duration: 1, ease: "circOut" }}
            className="h-full bg-white"
          />
          {MARKS.map((mark) => (
            <div
              key={mark}
              className={`absolute top-0 bottom-0 w-px ${
                mark === 1 ? "bg-zinc-500" : "bg-zinc-800"
              }`}
              style={{ left: `${(mark / RATING_SCALE) * 100}%` }}
            />
          ))}
        </div>
        <div className="relative h-4 mt-1 font-mono text-[9px] text-zinc-700">
          {MARKS.map((mark) => (
            <span
              key={mark}
              className={`absolute -translate-x-1/2 ${
                mark === 1 ? "text-zinc-500" : ""
              }`}
              style={{ left: `${(mark / RATING_SCALE) * 100}%` }}
            >
              {mark.toFixed(1)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
