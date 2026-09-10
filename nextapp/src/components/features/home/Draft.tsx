"use client";

import { useEffect, useState } from "react";
import { motion, useTransform, useMotionValue } from "framer-motion";
import { useStore } from "@/store";

interface Participant {
  id: string;
  draftOrder: number;
  profile: { name: string };
}

interface Team {
  id: string;
  name: string;
  participants: Participant[];
}

export const Draft = () => {
  const activeTournamentId = useStore((state) => state.activeTournamentId);
  const scrollProgress = useStore((state) => state.scrollYProgress);
  const fallback = useMotionValue(0);
  const activeProgress = scrollProgress ?? fallback;

  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!activeTournamentId) return;
    fetch(`/api/tournaments/${activeTournamentId}`)
      .then((r) => r.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(console.error);
  }, [activeTournamentId]);

  // Внутренний вертикальный скролл пока Draft в паузе (0.30 → 0.45)
  const y = useTransform(activeProgress, [0.30, 0.45], ["0px", "-900px"]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0a0a0a] border-l border-zinc-900">
      {/* Фиксированный заголовок */}
      <div className="absolute top-0 left-0 w-full z-30 bg-[#0a0a0a]">
        <div className="px-12 pt-12 pb-6">
          <p className="text-[10px] tracking-[0.4em] text-white/40 mb-2 uppercase">
            {"// Logic: Draft_Sequence_v4"}
          </p>
          <div className="flex justify-between items-end border-b border-zinc-800 pb-6">
            <h2 className="text-6xl font-black tracking-tighter uppercase">
              Team_Assembly
            </h2>
            <div className="text-right hidden md:block">
              <p className="text-[40px] font-light leading-none">
                {teams.length > 0
                  ? teams.length.toString().padStart(2, "0")
                  : "—"}
              </p>
              <p className="text-[10px] tracking-widest text-zinc-600 uppercase">
                Teams
              </p>
            </div>
          </div>
        </div>
        <div className="h-16 w-full bg-linear-to-b from-[#0a0a0a] to-transparent" />
      </div>

      {/* Скроллящийся контент */}
      <motion.div style={{ y }} className="px-12 pt-64 pb-96">
        {teams.length === 0 ? (
          <p className="text-zinc-700 font-mono text-xs tracking-widest uppercase pt-8">
            {activeTournamentId ? "Loading_Teams..." : "No_Tournament_Selected"}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
            {teams.map((team) => (
              <div
                key={team.id}
                className="group relative border border-zinc-800 bg-zinc-900/10 p-6 hover:bg-white transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-12 group-hover:text-black">
                  <span className="text-xs font-bold tracking-tighter uppercase">
                    {team.name}
                  </span>
                  <span className="text-[10px] opacity-40 italic">
                    {team.participants.length}p
                  </span>
                </div>

                <div className="space-y-6">
                  {team.participants.map((p, idx) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 group-hover:text-black"
                    >
                      <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-[10px] group-hover:bg-black group-hover:text-white shrink-0">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">
                          {p.profile.name}
                        </p>
                        <p className="text-[8px] text-zinc-600 uppercase group-hover:text-black/60">
                          Draft: #{p.draftOrder}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 h-8 w-full flex gap-1 opacity-20 group-hover:opacity-100 group-hover:invert transition-opacity">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white flex-1"
                      style={{ width: `${(i % 4) + 1}px` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <div className="absolute bottom-10 left-10 text-[12rem] font-black text-white/2 pointer-events-none select-none uppercase italic">
        DRAFT
      </div>
    </div>
  );
};
