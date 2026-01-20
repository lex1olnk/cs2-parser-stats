"use client";

export function ClutchStats({ data }: { data: any[] }) {
  return (
    <section className="grid grid-cols-5 gap-4">
      {data.map((item) => (
        <div key={item.type} className="space-y-3">
          <p className="text-[10px] font-black text-zinc-600 uppercase italic tracking-widest">
            {item.type}
          </p>
          <div className="flex h-7 border border-zinc-900 p-[1px]">
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
          </div>
          <p className="text-[9px] text-zinc-800 font-bold italic">
            {item.rounds} rounds
          </p>
        </div>
      ))}
    </section>
  );
}
