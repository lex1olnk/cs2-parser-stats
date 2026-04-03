"use server";

import { TournamentLeaderboard } from "@/components/TournamentLeaderboard";

// Имитация получения данных из БД
async function getTournamentData() {
  // const data = await prisma.tournament.findUnique({ ... })
  return {
    name: "PGL_Major_Copenhagen",
    status: "PLAY-OFF",
    teams: [
      { rank: 1, name: "Natus Vincere", win: 5, loss: 0, rating: 1.24 },
      { rank: 2, name: "FaZe Clan", win: 4, loss: 1, rating: 1.18 },
      { rank: 3, name: "G2 Esports", win: 3, loss: 2, rating: 1.15 },
      { rank: 4, name: "Team Vitality", win: 3, loss: 2, rating: 1.12 },
      { rank: 5, name: "Mousesports", win: 2, loss: 3, rating: 1.09 },
    ],
  };
}

export default async function MatchesPage() {
  const data = await getTournamentData();

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24">
      <div className="max-w-7xl mx-auto px-12">
        {/* Заголовок страницы */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-white text-black px-2 py-0.5 text-[10px] font-black uppercase">
              Tournament_Standings
            </span>
            <span className="text-zinc-600 font-mono text-[10px] tracking-widest">
              // GLOBAL_RANK_SYSTEM_V.2
            </span>
          </div>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase">
            {data.name.split("_").map((word, i) => (
              <span
                key={i}
                className={i % 2 === 0 ? "text-white" : "text-zinc-800"}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Левая колонка: Таблица лидеров */}
          <div className="col-span-8">
            <TournamentLeaderboard teams={data.teams} />
          </div>

          {/* Правая колонка: Техническая инфопанель */}
          <div className="col-span-4 space-y-8">
            <div className="border border-zinc-900 p-6 bg-zinc-900/5 backdrop-blur-sm">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">
                Event_Details
              </h3>
              <div className="space-y-4 font-mono text-[11px]">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600">STATUS:</span>
                  <span className="text-green-500">[ {data.status} ]</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600">PRIZE_POOL:</span>
                  <span className="text-white">$1,250,000</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-zinc-600">LOCATION:</span>
                  <span className="text-white">DENMARK</span>
                </div>
              </div>
            </div>

            <div className="h-64 border border-dashed border-zinc-800 flex items-center justify-center italic text-zinc-800 text-xs text-center px-12 uppercase tracking-widest">
              Live_Broadcasting_Subsystem_Awaiting_Signal
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
