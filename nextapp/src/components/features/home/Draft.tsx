export const Draft = () => (
  <section className="relative min-h-screen w-full bg-[#0a0a0a] py-24 overflow-hidden border-t border-zinc-900">
    <div className="container mx-auto px-6">
      {/* Заголовок секции */}
      <div className="flex justify-between items-end mb-16 border-b border-zinc-800 pb-8">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-white/40 mb-2 uppercase">
            // Logic: Draft_Sequence_v4
          </p>
          <h2 className="text-6xl font-black tracking-tighter uppercase">
            Team_Assembly
          </h2>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[40px] font-light leading-none">05</p>
          <p className="text-[10px] tracking-widest text-zinc-600 uppercase">
            Available_Slots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
        {/* Слот Команды 01 */}
        {[1, 2, 3].map((teamIdx) => (
          <div
            key={teamIdx}
            className="group relative border border-zinc-800 bg-zinc-900/10 p-6 hover:bg-white transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-12 group-hover:text-black">
              <span className="text-xs font-bold tracking-tighter">
                TEAM_UNIT_{teamIdx}
              </span>
              <span className="text-[10px] opacity-40 italic">
                #FF_00{teamIdx}
              </span>
            </div>

            {/* Список игроков в команде (TournamentParticipant) */}
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((playerIdx) => (
                <div
                  key={playerIdx}
                  className="flex items-center gap-4 group-hover:text-black"
                >
                  <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center text-[10px] group-hover:bg-black group-hover:text-white">
                    0{playerIdx}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-tight">
                      Player_Nickname
                    </p>
                    <p className="text-[8px] text-zinc-600 uppercase group-hover:text-black/60">
                      UID: {Math.random().toString(16).slice(2, 8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Декоративный штрих-код внизу */}
            <div className="mt-12 h-8 w-full flex gap-1 opacity-20 group-hover:opacity-100 group-hover:invert transition-opacity">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white flex-1"
                  style={{ width: `${Math.random() * 4}px` }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Фоновая надпись */}
      <div className="absolute -bottom-10 -left-10 text-[15rem] font-black text-white/[0.02] pointer-events-none select-none">
        DRAFT
      </div>
    </div>
  </section>
);
