"use client";

export type ClutchStat = {
  /** "1v1" … "1v5" */
  type: string;
  /** Процент выигранных клатчей этого типа, 0..100. */
  win: number;
  /** Сколько раз игрок вообще оказывался в такой ситуации. */
  rounds: number;
};

export function ClutchStats({ data }: { data: ClutchStat[] }) {
  return (
    <section className="grid grid-cols-5 gap-4">
      {data.map((item) => (
        <div key={item.type} className="space-y-3">
          <p className="text-[10px] font-black text-zinc-600 uppercase italic tracking-widest">
            {item.type}
          </p>
          <div className="flex h-7 border border-zinc-900 p-[1px]">
            {item.rounds === 0 ? (
              // Без единой ситуации показывать «0% / 100%» нельзя: пустая
              // категория читалась бы как стопроцентное поражение.
              <div className="flex-grow bg-zinc-900/40 h-full flex items-center justify-center">
                <span className="text-[9px] font-black text-zinc-700 italic uppercase tracking-widest">
                  No_data
                </span>
              </div>
            ) : (
              <>
                <div
                  style={{ width: `${item.win}%` }}
                  className="bg-white h-full flex items-center px-2 transition-all duration-1000"
                >
                  {item.win > 0 && (
                    <span className="text-[9px] font-black text-black italic">
                      {item.win}%
                    </span>
                  )}
                </div>
                <div className="flex-grow bg-zinc-900 h-full flex items-center justify-end px-2">
                  <span className="text-[9px] font-black text-zinc-700 italic">
                    {100 - item.win}%
                  </span>
                </div>
              </>
            )}
          </div>
          <p className="text-[9px] text-zinc-800 font-bold italic">
            {item.rounds} rounds
          </p>
        </div>
      ))}
    </section>
  );
}
