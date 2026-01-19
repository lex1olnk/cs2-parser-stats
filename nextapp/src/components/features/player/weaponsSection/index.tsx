// app/player/[id]/weapons/page.tsx
"use server";

import { getGraphWeapons } from "@/services/client";
import { WeaponsGraph } from "../WeaponsGraph";

export default async function WeaponsSection({
  playerId,
  tournamentId,
}: {
  playerId: number;
  tournamentId: string | null;
}) {
  const stats = await getGraphWeapons(playerId, tournamentId);

  if (!stats || stats.length === 0) return <div>Данные отсутствуют</div>;

  const transformedData = stats.map((weaponStat) => ({
    title: weaponStat.weapon,
    rows: [
      {
        key: "totalKills",
        label: "Всего убийств",
        value: weaponStat.kills,
      },
      { key: "wallbang", label: "Сквозь стену", value: weaponStat.wallbang },
      { key: "headshot", label: "Хедшоты", value: weaponStat.headshot },
      { key: "airshot", label: "В воздухе", value: weaponStat.airshot },
      ...(weaponStat.noscope !== null
        ? [{ key: "noscope", label: "Без прицела", value: weaponStat.noscope }]
        : []),
    ],
  }));

  return <WeaponsGraph data={transformedData} />;
}

export { WeaponsSkeleton } from "./WeaponsSkeleton";
