export const CombatData = () => (
  <section className="relative min-h-screen w-full bg-[#0a0a0a] border-t border-zinc-900 overflow-hidden flex items-center">
    {/* BACKGROUND MAP LAYER (Parallax) */}
    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
      <div className="relative w-[800px] h-[800px] border border-zinc-800 rounded-full animate-[spin_100s_linear_infinite]">
        {/* Имитация радара/карты */}
        <div className="absolute inset-0 border border-zinc-800 scale-75 rounded-full"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-zinc-800"></div>
        <div className="absolute left-1/2 top-0 w-[1px] h-full bg-zinc-800"></div>
      </div>
    </div>

    <div className="container mx-auto px-6 z-10 relative">
      {/* Section Header */}
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-[2px] bg-white"></div>
          <span className="text-[10px] tracking-[0.5em] uppercase text-zinc-400">
            Combat_Log_Analysis
          </span>
        </div>
        <h2 className="text-5xl font-black tracking-tighter uppercase italic">
          Kill_Events <span className="text-zinc-700">&</span> Damage_Flow
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Левая колонка: Список событий (MatchKill) */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          {[
            {
              id: "K_01",
              killer: "s1mple",
              victim: "ropz",
              headshot: true,
              dist: "24m",
            },
            {
              id: "K_02",
              killer: "ZywOo",
              victim: "m0NESY",
              headshot: false,
              dist: "12m",
            },
            {
              id: "K_03",
              killer: "NiKo",
              victim: "b1t",
              headshot: true,
              dist: "45m",
            },
          ].map((kill, idx) => (
            <div
              key={idx}
              className="group flex items-center justify-between border-b border-zinc-900 py-3 px-2 hover:bg-white hover:text-black transition-all cursor-crosshair"
            >
              <div className="flex flex-col">
                <span className="text-[8px] text-zinc-600 group-hover:text-black mb-1 italic">
                  {kill.id} // TICK_8492
                </span>
                <div className="flex items-center gap-2 font-bold text-sm uppercase">
                  <span>{kill.killer}</span>
                  <span className="text-zinc-600 text-[10px]">{">>"}</span>
                  <span>{kill.victim}</span>
                </div>
              </div>
              <div className="text-right">
                {kill.headshot && (
                  <span className="text-[9px] border border-current px-1 mr-2 font-bold">
                    HS
                  </span>
                )}
                <span className="text-[10px] opacity-60 font-mono">
                  {kill.dist}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Центральный визуализатор (Имитация MatchDamage) */}
        <div className="col-span-12 lg:col-span-8 relative flex items-center justify-center border border-zinc-800 h-[400px] bg-black/40 backdrop-blur-sm">
          <div className="absolute top-4 left-4 text-[10px] text-zinc-500 tracking-widest uppercase">
            // DATA_STREAM: MatchDamage_Normalized
          </div>

          {/* Декоративный элемент "Прицел" */}
          <div className="relative">
            {/* Наш SVG символ из предыдущих сообщений можно вставить сюда как акцент */}
            <svg
              width="120"
              height="120"
              viewBox="0 0 100 120"
              className="opacity-80"
            >
              <rect x="20" y="25" width="4" height="20" fill="white" />
              <circle cx="24" cy="15" r="3" fill="white" />
              <path
                d="M65 15 C 80 15, 90 25, 90 40 C 90 55, 80 65, 65 65 C 55 65, 47 60, 42 52"
                stroke="white"
                strokeWidth="4"
                fill="none"
              />
              <circle cx="58" cy="42" r="3" fill="white" />
            </svg>
          </div>

          {/* Floating Stats */}
          <div className="absolute bottom-8 right-8 text-right">
            <p className="text-4xl font-black italic leading-none">128.4</p>
            <p className="text-[9px] tracking-widest text-zinc-500 uppercase">
              Avg_Damage_Per_Round
            </p>
          </div>
        </div>
      </div>

      {/* Нижняя панель: Экономический статус (MatchPlayerEconomy) */}
      <div className="mt-20 grid grid-cols-5 gap-2 opacity-50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-1 bg-zinc-800 overflow-hidden relative">
            <div className="absolute inset-0 bg-white w-2/3"></div>
          </div>
        ))}
        <p className="col-span-5 text-[8px] text-zinc-700 tracking-[0.8em] uppercase mt-2 text-center">
          Global_Economy_Distribution_Stable
        </p>
      </div>
    </div>
  </section>
);
