// app/page.tsx
import { DeagleSection } from "@/components/features/home/DeagleSection";
import { Draft } from "@/components/features/home/Draft";
import { HeroSection } from "@/components/features/home/HeroSection";
import { MagicData } from "@/components/features/home/MagicData";
import { VerticalMatchSection } from "@/components/features/home/MatchList";
import { HomeClient } from "@/components/features/home/HomeClient";

export default async function Home() {
  return (
    <HomeClient>
      {/* Эти компоненты рендерятся на сервере и передаются как children */}
      <section className="w-screen h-screen shrink-0 border-r border-zinc-900">
        <HeroSection />
      </section>

      <section className="w-screen h-screen shrink-0 border-r border-zinc-900">
        <DeagleSection />
      </section>

      <section className="w-screen h-screen shrink-0 bg-black/80">
        <Draft />
      </section>

      <MagicData />

      <VerticalMatchSection />
    </HomeClient>
  );
}
