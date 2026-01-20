"use client";
import { motion } from "framer-motion";

export function StatsGrid({ stats }: { stats: any[] }) {
  return (
    <section className="space-y-12">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-8">
        <div className="bg-white text-black px-4 py-1 text-[11px] font-black uppercase italic">
          Main_Stats
        </div>
        <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
          UMC // SESSION_34
        </div>
      </div>

      {/* Сетка основных карточек */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-zinc-900 p-5 bg-zinc-900/5 group hover:bg-white transition-all duration-300"
          >
            <div className="flex justify-between items-start border-b border-zinc-800 group-hover:border-zinc-200 pb-3 mb-4">
              <div>
                <p className="text-[9px] uppercase text-zinc-600 group-hover:text-zinc-400 font-bold tracking-widest">
                  {stat.label}
                </p>
                <p className="text-3xl font-black italic tracking-tighter group-hover:text-black">
                  {stat.value}
                </p>
              </div>
              <span className="text-[8px] bg-zinc-800 text-white px-1.5 py-0.5 font-bold italic group-hover:bg-black">
                TOP {stat.top}
              </span>
            </div>

            <div className="space-y-1.5">
              {stat.details.map((d: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between text-[10px] font-bold uppercase tracking-tight"
                >
                  <span className="text-zinc-600 group-hover:text-zinc-400">
                    {d.n}
                  </span>
                  <span className="text-zinc-400 group-hover:text-black italic">
                    {d.v}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Нижний блок: Entry Success + Технические паттерны */}
      <div className="grid grid-cols-12 gap-8 items-center pt-8 border-t border-zinc-900">
        {/* Круговой индикатор Entry Success */}
        <div className="col-span-3 flex flex-col items-center relative">
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
              <motion.circle
                cx="64"
                cy="64"
                r="62"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="390"
                initial={{ strokeDashoffset: 390 }}
                whileInView={{ strokeDashoffset: 390 - 390 * 0.542 }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </svg>
            <div className="text-center">
              <span className="text-2xl font-black italic block">54.2%</span>
              <span className="text-[7px] uppercase text-zinc-600 font-black tracking-widest">
                Entry_Success
              </span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-700 mt-4 italic font-bold">
            142 W | 108 L
          </p>
        </div>

        {/* Мини-статы с "Зеброй" (как в Entry.png) */}
        <div className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-10">
          <MiniStat label="Matches" value="2342" />
          <ZebraPattern />
          <MiniStat label="FlashKills" value="142" />

          <MiniStat label="Trades" value="89" />
          <ZebraPattern />
          <MiniStat label="GrenadeDamage" value="12530" />
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-3 h-3 bg-white rotate-45 shrink-0" />
      <div>
        <p className="text-[9px] uppercase text-zinc-600 font-black tracking-[0.2em]">
          {label}
        </p>
        <p className="text-xl font-black italic leading-none text-zinc-200">
          {value}
        </p>
      </div>
    </div>
  );
}

function ZebraPattern() {
  return (
    <div className="h-6 w-full self-center bg-[repeating-linear-gradient(-45deg,#18181b,#18181b_4px,transparent_4px,transparent_10px)] opacity-30" />
  );
}
