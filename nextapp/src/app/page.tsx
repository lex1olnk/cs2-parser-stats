import { CombatData } from "@/components/features/home/CombatData";
import { Draft } from "@/components/features/home/Draft";
import { HeroSection } from "@/components/features/home/HeroSection";
import { HybridScroll } from "@/components/features/home/HybridScroll";
import { MagicData } from "@/components/features/home/MagicData";
import { VerticalMatchSection } from "@/components/features/home/MatchList";

// Для реализации параллакса на чистом CSS/Tailwind без тяжелых библиотек
// мы будем использовать группу 'group' и CSS-переменные или просто фиксированные слои.

export default async function Home() {
  return (
    /* Контейнер теперь h-full или min-h-screen, убираем жесткий grid-rows */
    <div>
      {/* GRID DECORATION */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      ></div>
      <HybridScroll>
        <section className="w-screen h-screen shrink-0 border-r border-zinc-900">
          <HeroSection /> {/* Тот код, что мы писали ранее */}
        </section>
        {/* СЕКЦИЯ 2: COMBAT DATA */}
        <section className="w-screen h-screen flex-shrink-0 border-r border-zinc-900 bg-[#0d0d0d]">
          <CombatData />
        </section>
        {/* СЕКЦИЯ 3: TEAM ASSEMBLY */}
        <section className="w-screen h-screen flex-shrink-0">
          <Draft />
        </section>
        <MagicData /> {/* Секция 4: Горизонтально */}
        <VerticalMatchSection /> {/* Секция 5: ВЕРТИКАЛЬНАЯ */}
      </HybridScroll>
    </div>
  );
}
