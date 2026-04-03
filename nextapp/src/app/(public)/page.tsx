// app/page.tsx
import { DeagleSection } from "@/components/features/home/DeagleSection";
import { Draft } from "@/components/features/home/Draft";
import { HeroSection } from "@/components/features/home/HeroSection";
import { MagicData } from "@/components/features/home/MagicData";
import { VerticalMatchSection } from "@/components/features/home/MatchList";
import { HomeClient } from "@/components/features/home/HomeClient";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const raw = await prisma.tournament.findMany({
    orderBy: { createdAt: "desc" },
  });
  const tournaments = raw.map((t) => ({ ...t, mvpId: t.mvpId ?? undefined }));

  return (
    <HomeClient tournaments={tournaments}>
      {/* Эти компоненты рендерятся на сервере и передаются как children */}
      <section className="w-screen h-screen shrink-0 border-r border-zinc-900">
        <HeroSection tournaments={tournaments} />
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
