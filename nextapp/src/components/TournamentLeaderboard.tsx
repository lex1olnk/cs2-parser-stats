"use client";
import { motion } from "framer-motion";

export const TournamentLeaderboard = ({ teams }: { teams: any[] }) => {
  return (
    <div className="w-full">
      {/* Шапка таблицы */}
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        <div className="col-span-1">Rank</div>
        <div className="col-span-6">Team_Entity</div>
        <div className="col-span-2 text-center">W / L</div>
        <div className="col-span-3 text-right">Rating</div>
      </div>

      {/* Строки таблицы */}
      <div className="mt-2 space-y-1">
        {teams.map((team, i) => (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            key={team.name}
            className="group grid grid-cols-12 gap-4 items-center px-6 py-5 border border-zinc-900 bg-black hover:bg-white transition-all duration-300 cursor-default"
          >
            <div className="col-span-1 font-mono text-2xl font-black italic text-zinc-800 group-hover:text-black/20">
              {team.rank.toString().padStart(2, "0")}
            </div>

            <div className="col-span-6 flex items-center gap-4">
              <div className="w-8 h-8 bg-zinc-900 group-hover:bg-zinc-200 shrink-0" />
              <span className="text-xl font-bold uppercase tracking-tighter group-hover:text-black">
                {team.name}
              </span>
            </div>

            <div className="col-span-2 text-center font-mono text-sm group-hover:text-black font-bold">
              {team.win} - {team.loss}
            </div>

            <div className="col-span-3 text-right">
              <span className="text-2xl font-black italic tracking-tighter group-hover:text-black leading-none">
                {team.rating}
              </span>
              <div className="h-1 w-full bg-zinc-900 mt-1 overflow-hidden group-hover:bg-zinc-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(team.rating / 1.5) * 100}%` }}
                  className="h-full bg-white group-hover:bg-black"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
