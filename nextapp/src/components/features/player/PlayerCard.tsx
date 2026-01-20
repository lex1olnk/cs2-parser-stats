"use client";
import { motion } from "framer-motion";

export function PlayerCard({ user }: { user: any }) {
  return (
    <section className="relative border border-zinc-900 p-10 bg-zinc-900/5">
      <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-zinc-600" />
      <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-zinc-600" />

      <div className="grid grid-cols-12 gap-8 items-start">
        <div className="col-span-4 flex gap-6">
          <div className="w-24 h-24 bg-zinc-800 rounded-full shrink-0" />
          <div>
            <p className="text-[10px] text-zinc-600 tracking-widest uppercase mb-1">
              Player
            </p>
            <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter">
              {user.nickname}
            </h1>
            <span className="text-[10px] text-zinc-500 font-bold italic mt-2 block">
              {user.id}
            </span>
          </div>
        </div>

        <div className="col-span-3">
          <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">
            UL Rating
          </p>
          <p className="text-3xl font-black italic">^{user.rating}</p>
        </div>

        <div className="col-span-5 text-right space-y-6">
          <div className="space-y-1 text-[11px] font-bold uppercase italic text-zinc-500">
            <p>
              ULTournaments{" "}
              <span className="text-white ml-4">{user.stats.matches}</span>
            </p>
            <p>
              MVP <span className="text-white ml-4">{user.stats.mvp}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 h-5 border border-zinc-900 p-[2px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${user.rating}%` }}
          transition={{ duration: 1, ease: "circOut" }}
          className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)]"
        />
      </div>
    </section>
  );
}
