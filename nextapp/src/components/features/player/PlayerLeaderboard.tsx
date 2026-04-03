"use client";
import { motion } from "framer-motion";

interface Player {
  id: number;
  nickname: string;
  team: string;
  rating: number;
  kills: number;
  adr: number;
  hs: number;
}

export const PlayerLeaderboard = ({ players }: { players: Player[] }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
        <div className="col-span-1">Rank</div>
        <div className="col-span-4">Player</div>
        <div className="col-span-2 text-center">Kills</div>
        <div className="col-span-2 text-center">ADR</div>
        <div className="col-span-1 text-center">HS%</div>
        <div className="col-span-2 text-right">Rating</div>
      </div>

      <div className="mt-2 space-y-1">
        {players.map((player, i) => (
          <motion.div
            key={player.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            className="group grid grid-cols-12 gap-4 items-center px-6 py-5 border border-zinc-900 bg-black hover:bg-white transition-all duration-300 cursor-default"
          >
            <div className="col-span-1 font-mono text-2xl font-black italic text-zinc-800 group-hover:text-black/20">
              {(i + 1).toString().padStart(2, "0")}
            </div>

            <div className="col-span-4 flex flex-col">
              <span className="text-lg font-bold uppercase tracking-tighter group-hover:text-black">
                {player.nickname}
              </span>
              <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 uppercase tracking-widest">
                {player.team}
              </span>
            </div>

            <div className="col-span-2 text-center font-mono text-sm font-bold group-hover:text-black">
              {player.kills}
            </div>

            <div className="col-span-2 text-center font-mono text-sm font-bold group-hover:text-black">
              {player.adr.toFixed(1)}
            </div>

            <div className="col-span-1 text-center font-mono text-sm font-bold group-hover:text-black">
              {player.hs}%
            </div>

            <div className="col-span-2 text-right">
              <span className="text-2xl font-black italic tracking-tighter group-hover:text-black leading-none">
                {player.rating.toFixed(2)}
              </span>
              <div className="h-1 w-full bg-zinc-900 mt-1 overflow-hidden group-hover:bg-zinc-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(player.rating / 1.6) * 100}%` }}
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
