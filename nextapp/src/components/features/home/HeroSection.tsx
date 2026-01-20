export const HeroSection = () => (
  <section className="relative w-screen h-screen shrink-0 overflow-hidden flex items-center border-r border-zinc-900">
    {/* Горизонтальная направляющая линия через весь экран */}
    <div className="absolute top-[35%] left-0 w-full h-px bg-linear-to-r from-zinc-800 via-zinc-700 to-transparent opacity-50"></div>

    {/* Декоративные координаты в углах */}
    <div className="absolute top-10 left-10 text-[8px] text-zinc-600 tracking-[0.5em] uppercase">
      Loc: 52.5200° N, 13.4050° E // Server_Node_01
    </div>

    <main className="relative z-10 w-full px-12 md:px-24">
      <div className="grid grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-7 flex flex-col items-start">
          <div className="mb-6 flex items-center gap-4">
            <span className="bg-white text-black px-3 py-1 text-[10px] font-black tracking-[0.4em] uppercase">
              System_Init
            </span>
            <span className="text-zinc-600 text-[10px] tracking-widest uppercase font-mono">
              [ 00 : 00 : 01 : 94 ]
            </span>
          </div>

          <h1 className="text-8xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.8] mb-12 select-none">
            Prin_
            <br />
            <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-white via-white to-zinc-500">
              Stream
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-white"></span>
            </span>
          </h1>

          <div className="flex gap-12 text-[9px] tracking-[0.4em] text-zinc-500 uppercase font-mono">
            <div className="group cursor-help border-l border-zinc-800 pl-4">
              <p className="text-zinc-400 mb-1">Total_Sessions</p>
              <p className="text-white font-bold tracking-normal text-lg">
                1,204,812
              </p>
            </div>
            <div className="group cursor-help border-l border-zinc-800 pl-4">
              <p className="text-zinc-400 mb-1">Data_Integrity</p>
              <p className="text-white font-bold tracking-normal text-lg">
                99.98%
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tournament Preview Card */}
        <div className="col-span-12 lg:col-span-5 relative pr-12">
          {/* Внешний декоративный контур */}
          <div className="absolute -inset-4 border border-zinc-800/50 pointer-events-none"></div>

          <div className="relative border border-zinc-700 p-1 bg-zinc-900/30 backdrop-blur-md transition-transform duration-500 hover:scale-[1.02]">
            {/* Уголки с инверсией */}
            <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-2 border-l-2 border-white z-20"></div>
            <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-2 border-r-2 border-white z-20"></div>

            <div className="bg-black p-10 border border-zinc-800 relative overflow-hidden">
              <div className="flex justify-between items-center mb-12">
                <div className="space-y-1">
                  <p className="text-[9px] text-white font-black uppercase tracking-[0.3em]">
                    Live_Feed
                  </p>
                  <p className="text-[8px] text-zinc-600 font-mono">
                    ID: 88-FF-092
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-white animate-pulse"></div>
                  <div className="w-2 h-2 bg-zinc-800"></div>
                  <div className="w-2 h-2 bg-zinc-800"></div>
                </div>
              </div>

              <h3 className="text-4xl font-black mb-1 tracking-tighter italic">
                PGL_MAJOR_2026
              </h3>
              <p className="text-zinc-500 text-[10px] mb-12 tracking-[0.2em] uppercase">
                // <span className="text-white">Analyzing</span>
                _Active_Packets...
              </p>

              <div className="grid grid-cols-2 gap-10 mb-12 relative">
                <div className="group">
                  <span className="block text-[10px] text-zinc-600 mb-2 uppercase tracking-widest">
                    Teams
                  </span>
                  <span className="text-3xl font-light tracking-tighter group-hover:text-white transition-colors">
                    24/24
                  </span>
                </div>
                <div className="group">
                  <span className="block text-[10px] text-zinc-600 mb-2 uppercase tracking-widest">
                    Matches
                  </span>
                  <span className="text-3xl font-light tracking-tighter group-hover:text-white transition-colors">
                    152
                  </span>
                </div>
              </div>

              <button className="group relative w-full py-5 bg-white text-black font-black text-[11px] tracking-[0.4em] uppercase overflow-hidden transition-all duration-300 active:scale-95">
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">
                  {"Access_Statistics_>>"}
                </span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Большая фоновая надпись смещена для лучшего баланса */}
      <div className="absolute -bottom-20 left-10 text-[25rem] font-black text-white/3 pointer-events-none select-none leading-none tracking-tighter">
        01
      </div>
    </main>
  </section>
);
