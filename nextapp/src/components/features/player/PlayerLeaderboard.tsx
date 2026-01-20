"use client";
import { motion } from "framer-motion";

export const PlayerLeaderboard = ({ players }: { players: any[] }) => {
  return (
    <div className="space-y-2">
      {/* Table Header */}
      <div className="grid grid-cols-12 px-8 py-4 text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] border-b border-zinc-900">
        <div className="col-span-1">#Pos</div>
        <div className="col-span-5">Player_Identify</div>
        <div className="col-span-2">Kills</div>
        <div className="col-span-2">HS_%</div>
        <div className="col-span-2 text-right">Rating_Impact</div>
      </div>

      {players.map((player, index) => (
        <motion.div
          key={player.nickname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group grid grid-cols-12 items-center px-8 py-6 bg-[#0d0d0d] border border-zinc-900 hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden"
        >
          {/* Rank Number */}
          <div className="col-span-1 font-mono text-xl font-black italic opacity-20 group-hover:opacity-100">
            {(index + 1).toString().padStart(2, "0")}
          </div>

          {/* Player Info */}
          <div className="col-span-5 flex items-center gap-6">
            <div className="w-12 h-12 bg-zinc-900 group-hover:bg-zinc-200 relative overflow-hidden">
              {/* Сюда можно вставить Image аватара */}
              <div className="absolute inset-0 border border-white/5 group-hover:border-black/10" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-1">
                {player.nickname}
              </span>
              <span className="text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 font-bold uppercase tracking-widest">
                {player.team} // CLAN_NODE
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="col-span-2 font-mono text-lg font-bold">
            {player.kills}
          </div>
          <div className="col-span-2 font-mono text-lg font-bold">
            {player.hs}%
          </div>

          {/* Rating with Visual Bar */}
          <div className="col-span-2 text-right relative h-full flex flex-col justify-center">
            <span className="text-3xl font-black italic leading-none mb-1">
              {player.rating.toFixed(2)}
            </span>
            <div className="w-full h-1 bg-zinc-900 overflow-hidden group-hover:bg-zinc-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(player.rating / 1.6) * 100}%` }}
                className="h-full bg-white group-hover:bg-black shadow-[0_0_10px_white] group-hover:shadow-none"
              />
            </div>
          </div>

          {/* Decorative Corner Element */}
          <div className="absolute top-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-2 right-2 w-1 h-1 bg-black" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};
