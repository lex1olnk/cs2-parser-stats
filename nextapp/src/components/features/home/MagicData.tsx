"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store";

interface TournamentStats {
  name: string;
  createdAt: string;
  totalMatches: number;
  totalKills: number;
}

export const MagicData = () => {
  const activeTournamentId = useStore((state) => state.activeTournamentId);
  const tournaments = useStore((state) => state.tournaments);
  const [stats, setStats] = useState<TournamentStats | null>(null);

  useEffect(() => {
    if (!activeTournamentId) return;

    fetch(`/api/tournaments/${activeTournamentId}/stats`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, [activeTournamentId]);

  const activeTournament = tournaments.find((t) => t.id === activeTournamentId);
  const createdAt = activeTournament?.createdAt
    ? new Date(activeTournament.createdAt).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
      })
    : "—";

  return (
    <section className="relative w-screen h-screen shrink-0 overflow-hidden bg-[#0a0a0a]">
      {/* ВИДЕО-СФЕРА */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[75vh] h-[75vh]">
          <div className="w-full h-full rounded-full overflow-hidden border border-zinc-800 bg-black shadow-[0_0_100px_rgba(255,255,255,0.02)]">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/video.webm" />
            </video>
          </div>
        </div>
      </div>

      {/* UI ЭЛЕМЕНТЫ ПО СЕТКЕ */}
      <div className="relative z-10 w-full h-full grid grid-cols-12 grid-rows-6 p-12">
        {/* Tournament Info (Top Left) */}
        <div className="col-start-2 row-start-1 mt-4">
          <div className="bg-zinc-800/40 w-16 h-16 mb-4 border border-zinc-700" />
          <p className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase font-mono">
            {activeTournament?.name ?? "No_Tournament"}
          </p>
          <p className="text-[10px] text-zinc-500 tracking-[0.4em] uppercase font-mono">
            {createdAt}
          </p>
        </div>

        {/* Главный блок — убийства за турнир */}
        <div className="col-start-8 col-span-4 row-start-3 self-center">
          <div className="relative bg-white text-black p-12 shadow-[30px_30px_60px_rgba(0,0,0,0.5)]">
            <div
              className="absolute top-0 left-0 w-12 h-12 bg-[#0a0a0a]"
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            />
            <span className="absolute top-4 right-6 text-[10px] font-black tracking-widest uppercase opacity-40 italic">
              Всего убийств
            </span>
            <div className="flex items-baseline mb-4">
              <h2 className="text-[8rem] font-black leading-[0.7] tracking-tighter">
                {stats ? stats.totalKills.toLocaleString("ru-RU") : "—"}
              </h2>
            </div>
            <p className="text-[11px] font-bold leading-tight tracking-wide border-t border-black/10 pt-6 uppercase">
              {stats
                ? `${stats.totalMatches} матч${stats.totalMatches === 1 ? "" : stats.totalMatches < 5 ? "а" : "ей"} сыграно`
                : "Выберите турнир"}
            </p>
          </div>
        </div>

        {/* Матчи (Bottom Left) */}
        <div className="col-start-2 row-start-6 self-end pb-8">
          <p className="text-[9px] text-zinc-600 mb-2 tracking-[0.3em] uppercase font-mono">
            Матчей:
          </p>
          <div className="flex items-center gap-6">
            <span className="text-7xl font-black text-zinc-800/50">
              {stats?.totalMatches ?? "0"}
            </span>
            <div className="w-24 h-1 bg-orange-700 relative">
              <div className="absolute right-0 -top-[3px] w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#c2410c]" />
            </div>
          </div>
        </div>

        {/* Кресты (Right Side) */}
        <div className="col-start-12 row-start-3 row-span-2 flex flex-col justify-between items-center py-10">
          <div className="text-white text-4xl font-light select-none">✕</div>
          <div className="text-white text-4xl font-light select-none">✕</div>
          <div className="text-zinc-800 text-4xl font-light select-none">✕</div>
          <div className="text-white text-4xl font-light select-none">✕</div>
        </div>
      </div>

      <div className="absolute top-[20%] left-[15%] w-40 h-40 border border-white/5 -z-10" />
      <div className="absolute bottom-[10%] left-[45%] w-60 h-80 bg-white/5 border border-white/5 -z-10" />
    </section>
  );
};
