import { PlayerLeaderboard } from "@/components/features/player/PlayerLeaderboard";

async function getTopPlayers(tournamentId: string) {
  // Имитация запроса к БД
  return [
    {
      id: 1,
      nickname: "s1mple",
      team: "NAVI",
      rating: 1.35,
      kills: 245,
      adr: 89.4,
      hs: 42,
    },
    {
      id: 2,
      nickname: "zywoo",
      team: "Vitality",
      rating: 1.32,
      kills: 238,
      adr: 85.2,
      hs: 38,
    },
    {
      id: 3,
      nickname: "donk",
      team: "Spirit",
      rating: 1.48,
      kills: 289,
      adr: 98.1,
      hs: 55,
    },
    {
      id: 4,
      nickname: "m0nesy",
      team: "G2",
      rating: 1.28,
      kills: 210,
      adr: 82.5,
      hs: 32,
    },
    {
      id: 5,
      nickname: "niko",
      team: "G2",
      rating: 1.21,
      kills: 205,
      adr: 88.7,
      hs: 48,
    },
  ].sort((a, b) => b.rating - a.rating);
}

export default async function PlayersTopPage({
  searchParams,
}: {
  searchParams: { tournament?: string };
}) {
  const tournamentId = searchParams.tournament || "PGL_2024";
  const players = await getTopPlayers(tournamentId);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-12">
        {/* Заголовок с "кодом" турнира */}
        <header className="mb-20 border-l-4 border-white pl-8">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-zinc-600 font-mono text-xs tracking-[0.5em]">
              DATA_EXTRACT // PLAYERS_STAT
            </span>
            <div className="h-px w-24 bg-zinc-800" />
          </div>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-none">
            Top_Performers <br />
            <span className="text-zinc-800">[{tournamentId}]</span>
          </h1>
        </header>

        {/* Сетка: Главный топ + боковая панель */}
        <div className="grid grid-cols-12 gap-16">
          <div className="col-span-12 lg:col-span-9">
            <PlayerLeaderboard players={players} />
          </div>

          <aside className="col-span-3 hidden lg:block space-y-12">
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 italic">
                Performance_Legend
              </h4>
              <div className="space-y-4 font-mono text-[10px]">
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 bg-white" />
                  <span className="text-zinc-400">
                    RATING 2.0 {">"} 1.20 (ELITE)
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-2 h-2 bg-zinc-800" />
                  <span className="text-zinc-600">AVERAGE_ZONE (1.00)</span>
                </div>
              </div>
            </div>

            <div className="p-6 border border-zinc-900 bg-zinc-900/10">
              <p className="text-[9px] leading-relaxed text-zinc-500 font-mono italic">
                Все данные синхронизированы с официальным HLTV API. Рейтинг
                рассчитывается на основе Impact, KDR и ADR за весь период
                турнира.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
