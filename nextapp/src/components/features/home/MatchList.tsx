"use client";
import { useStore } from "@/store";
import { motion, useTransform, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

interface MatchTeam {
  name: string;
  score: number;
  isWinner: boolean;
}

interface Match {
  id: string;
  startedAt: string;
  teams: MatchTeam[];
}

export const VerticalMatchSection = () => {
  const scrollProgress = useStore((state) => state.scrollYProgress);
  const activeTournamentId = useStore((state) => state.activeTournamentId);
  const fallback = useMotionValue(0);
  const activeProgress = scrollProgress ?? fallback;

  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const url = activeTournamentId
      ? `/api/matches?tournamentId=${activeTournamentId}&limit=20&orderBy=startedAt&sortOrder=desc`
      : `/api/matches?limit=20&orderBy=startedAt&sortOrder=desc`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => setMatches(data.data ?? []))
      .catch(console.error);
  }, [activeTournamentId]);

  const y = useTransform(activeProgress, [0.80, 0.95], ["0px", "-1200px"]);
  const indicatorY = useTransform(activeProgress, [0.80, 0.95], ["0%", "100%"]);

  return (
    <div className="relative h-full w-screen bg-[#0a0a0a] overflow-hidden border-l border-zinc-900 font-mono snap-start">
      {/* HEADER */}
      <div className="absolute top-0 left-0 w-full z-30 bg-[#0a0a0a]">
        <div className="p-12 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-1 bg-white" />
            <span className="text-zinc-600 text-[10px] tracking-[0.4em] uppercase font-mono">
              System_Log // Match_Entries
            </span>
          </div>
          <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-none select-none">
            History<span className="text-zinc-800">.exe</span>
          </h2>
        </div>
        <div className="h-16 w-full bg-gradient-to-b from-[#0a0a0a] to-transparent" />
      </div>

      {/* MATCH LIST */}
      <div className="relative h-full w-full">
        <motion.div style={{ y }} className="px-12 space-y-1 pt-72 pb-96">
          {matches.length === 0 ? (
            <p className="text-zinc-700 text-xs tracking-widest uppercase pt-8">
              No_Match_Data
            </p>
          ) : (
            matches.map((match) => {
              const winner = match.teams?.find((t) => t.isWinner);
              const loser = match.teams?.find((t) => !t.isWinner);
              const date = match.startedAt
                ? new Date(match.startedAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "—";
              const time = match.startedAt
                ? new Date(match.startedAt).toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—";

              return (
                <div
                  key={match.id}
                  className="group flex justify-between items-center p-5 border border-zinc-900 bg-zinc-900/10 hover:bg-white hover:text-black transition-all duration-300 cursor-crosshair relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-white scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-600 group-hover:text-black/50 mb-1">
                      ID: 0x{match.id.slice(0, 6).toUpperCase()}{" // "}
                      {date}{" "}
                      {time}
                    </span>
                    <span className="text-xl font-bold uppercase italic tracking-tight transition-transform group-hover:translate-x-2 font-sans">
                      Winner:{" "}
                      <span className="text-zinc-400 group-hover:text-black">
                        {winner?.name ?? "—"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-8 text-right">
                    <div className="hidden md:block">
                      <p className="text-[8px] text-zinc-700 group-hover:text-black tracking-widest uppercase">
                        Score_Result
                      </p>
                      <p className="text-lg font-black italic">
                        {winner?.score ?? "—"} : {loser?.score ?? "—"}
                      </p>
                    </div>
                    <div className="w-8 h-8 border border-zinc-800 flex items-center justify-center group-hover:border-black">
                      <div className="w-1.5 h-1.5 bg-zinc-800 group-hover:bg-black" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* SIDE INDICATOR */}
      <div className="absolute right-12 top-[40%] h-48 w-[1px] bg-zinc-900 hidden lg:block z-40">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-zinc-700 tracking-tighter vertical-text uppercase">
          Scroll
        </div>
        <motion.div
          style={{ y: indicatorY }}
          className="absolute -left-[2px] w-[5px] h-10 bg-white"
        />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-zinc-700">
          END
        </div>
      </div>

      <div className="absolute bottom-10 right-24 text-[10rem] font-black text-white/2 pointer-events-none select-none italic z-0 uppercase">
        Data
      </div>
    </div>
  );
};
