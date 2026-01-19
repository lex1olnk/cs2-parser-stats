import { Suspense } from "react";

import { StatsSection } from "@/components/features/player/statsSection";
import {
  ClutchSection,
  ClutchSkeleton,
} from "@/components/features/player/clutchSection";

// Типизация пропсов для Next.js 15
interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PlayerPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sParams = await searchParams;

  const playerId = parseInt(id, 10);
  const tournamentId =
    typeof sParams.tournamentId === "string" ? sParams.tournamentId : null;

  return (
    // Используем семантичный тег main и стандартизируем контейнер
    <main className="relative flex flex-col w-full max-w-6xl mx-auto gap-8 p-4">
      {/* Карточка игрока обычно идет первой и часто не требует Suspense, 
          если данные критичны для LCP (первой отрисовки) */}

      {/* Секции с тяжелыми данными оборачиваем в Suspense */}
      {/*
      <Suspense fallback={<WeaponsSkeleton />}>
        <WeaponsSection playerId={playerId} tournamentId={tournamentId} />
      </Suspense>
      */}
      <Suspense fallback={<ClutchSkeleton />}>
        <ClutchSection playerId={playerId} tournamentId={tournamentId} />
      </Suspense>

      <Suspense fallback={<div>Loading stats...</div>}>
        <StatsSection playerId={playerId} tournamentId={tournamentId} />
      </Suspense>
    </main>
  );
}
