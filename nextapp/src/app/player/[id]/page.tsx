import { PlayerCard } from "@/components/features/player/PlayerCard";
import { StatsGrid } from "@/components/features/player/StatsGrid";
import { ClutchStats } from "@/components/features/player/ClutchStats";
import { DuelMasters } from "@/components/features/player/DuelMasters";

// Имитация получения данных с сервера (Prisma/API)
async function getUserData(id: string) {
  return {
    nickname: "UlName",
    id: "#136243",
    rating: 84,
    elo: 2342,
    stats: {
      matches: 34,
      mvp: 5,
      captains: 5,
    },
    clutches: [
      { type: "1v1", win: 54.2, rounds: 242 },
      { type: "1v2", win: 54.2, rounds: 242 },
      { type: "1v3", win: 54.2, rounds: 242 },
      { type: "1v4", win: 0, rounds: 2 },
      { type: "1v5", win: 0, rounds: 2 },
    ],
  };
}

async function getStatsGrid() {
  return [
    {
      label: "Avg Damage",
      value: "145.2",
      top: "0.1%",
      details: [
        { n: "Damage", v: 15232 },
        { n: "WinDamage", v: 12232 },
        { n: "Rounds", v: 123 },
      ],
    },
    {
      label: "K/D Ratio",
      value: "1.45",
      top: "0.1%",
      details: [
        { n: "Kills", v: 15232 },
        { n: "Deaths", v: 10500 },
        { n: "Damage", v: 15232 },
      ],
    },
    {
      label: "Headshot%",
      value: "54.2%",
      top: "0.5%",
      details: [
        { n: "Headshots", v: 8250 },
        { n: "Kills", v: 15232 },
      ],
    },
    {
      label: "Rating",
      value: "1.35",
      top: "0.1%",
      details: [
        { n: "Impact", v: 1.42 },
        { n: "Cast", v: "75%" },
      ],
    },
  ];
}

export default async function UserProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const user = await getUserData(id);
  const stats = await getStatsGrid();
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-12 font-mono selection:bg-white selection:text-black">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Рендерим клиентские компоненты и передаем в них данные через props */}
        <PlayerCard user={user} />

        <StatsGrid stats={stats} />

        <ClutchStats data={user.clutches} />

        <DuelMasters />
      </div>
    </main>
  );
}
