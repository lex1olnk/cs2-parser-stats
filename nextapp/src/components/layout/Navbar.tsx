import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  return (
    /* Контейнер-обертка, который всегда прижат к верху */
    <div className="fixed top-0 left-0 w-full z-100 group">
      {/* "Сенсорная" область: невидимая полоса 10px, которая ловит наведение */}
      <div className="absolute top-0 left-0 w-full h-4 bg-transparent z-10" />

      {/* Основной Navbar */}
      <nav
        className={`
        bg-black/80 backdrop-blur-md border-b border-zinc-800 w-full
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        transform -translate-y-[calc(100%-4px)] group-hover:translate-y-0
      `}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Левая часть */}
            <div className="flex items-center gap-6">
              <Link href="/" className="relative">
                {/* Декоративная рамка вокруг лого в стиле Printstream */}
                <div className="absolute -inset-1 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src={"/ul2.png"}
                  alt="logo"
                  width={32}
                  height={32}
                  className="relative z-10 brightness-110"
                />
              </Link>

              {/* Технический текст (виден только когда открыто) */}
              <span className="hidden md:block text-[10px] text-zinc-600 tracking-[0.3em] font-mono">
                NET_LINK_ESTABLISHED // NODE_01
              </span>
            </div>

            {/* Правая часть */}
            <div className="flex items-center space-x-2">
              <Link
                href="/matches"
                className="relative overflow-hidden px-6 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white border border-zinc-800 hover:border-white transition-colors group/btn"
              >
                <span className="relative z-10">Топ_15</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>

        {/* Декоративная полоска снизу (индикатор, что меню здесь) */}
        <div className="h-0.5 w-full bg-zinc-900 group-hover:bg-white transition-colors duration-700" />
      </nav>

      {/* Маленький "язычок" или подсказка, когда меню скрыто */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-0.5 bg-zinc-900 border border-t-0 border-zinc-800 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
        <div className="w-8 h-1 bg-zinc-700 rounded-full" />
      </div>
    </div>
  );
}
