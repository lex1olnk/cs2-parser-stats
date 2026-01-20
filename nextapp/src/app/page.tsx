import { CombatData } from "@/components/features/home/CombatData";
import { Draft } from "@/components/features/home/Draft";
import { HeroSection } from "@/components/features/home/HeroSection";
import { MagicData } from "@/components/features/home/MagicData";
import HorizontalScrollRoot from "@/components/layout/HorizontalScrollRoot";
import { SearchComponent } from "@/components/SearchComponent";
import { api } from "@/lib/api";
import Image from "next/image";

// Для реализации параллакса на чистом CSS/Tailwind без тяжелых библиотек
// мы будем использовать группу 'group' и CSS-переменные или просто фиксированные слои.

export default async function Home() {
  return (
    /* Контейнер теперь h-full или min-h-screen, убираем жесткий grid-rows */

    <HorizontalScrollRoot>
      {/* СЕКЦИЯ 1: HERO */}
      <section className="w-screen h-screen shrink-0 border-r border-zinc-900">
        <HeroSection /> {/* Тот код, что мы писали ранее */}
      </section>

      {/* СЕКЦИЯ 2: COMBAT DATA */}
      <section className="w-screen h-screen shrink-0 border-r border-zinc-900 bg-[#0d0d0d]">
        <CombatData />
      </section>

      {/* СЕКЦИЯ 3: TEAM ASSEMBLY */}
      <section className="w-screen h-screen shrink-0">
        <Draft />
      </section>

      {/* СЕКЦИЯ 4: COMBAT DATA */}
      <section className="w-screen h-screen shrink-0 border-r border-zinc-900 bg-[#0d0d0d]">
        <MagicData />
      </section>
    </HorizontalScrollRoot>
  );
}
