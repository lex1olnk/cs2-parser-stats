"use client";
import { motion } from "framer-motion";
import { useStore } from "@/store";
import { useEffect } from "react";

interface Tournament {
  id: string;
  name: string;
  status: string;
}

interface HeroSectionProps {
  tournaments: Tournament[];
}

export const HeroSection = ({ tournaments }: HeroSectionProps) => {
  const activeTournamentId = useStore((state) => state.activeTournamentId);
  const setActiveTournamentId = useStore((state) => state.setActiveTournamentId);

  // Выбираем первый турнир по умолчанию
  useEffect(() => {
    if (tournaments.length > 0 && !activeTournamentId) {
      setActiveTournamentId(tournaments[0].id);
    }
  }, [tournaments, activeTournamentId, setActiveTournamentId]);

  const currentId = activeTournamentId ?? tournaments[0]?.id ?? null;

  return (
    <section className="h-full w-full relative flex flex-col justify-center px-12">
      <div className="space-y-4">
        <span className="text-zinc-600 font-mono text-[10px] tracking-[0.5em]">
          SELECT_ACTIVE_DATABASE_NODE
        </span>
        <div className="flex flex-wrap gap-4">
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTournamentId(t.id)}
              className={`px-6 py-3 border transition-all duration-300 uppercase font-black italic tracking-tighter text-2xl ${
                currentId === t.id
                  ? "bg-white text-black border-white"
                  : "border-zinc-900 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={currentId ?? "empty"}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-10 right-10 text-[15vw] font-black text-white/5 pointer-events-none uppercase italic leading-none"
      >
        {tournaments.find((t) => t.id === currentId)?.name.split("_")[0] ??
          tournaments.find((t) => t.id === currentId)?.name.slice(0, 6)}
      </motion.div>
    </section>
  );
};
