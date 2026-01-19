import { SearchComponent } from "@/components/SearchComponent";
import { api } from "@/lib/api";
import Image from "next/image";

interface Player {
  id: string;
  nickname: string;
}

export const revalidate = 3600;

async function getPlayers() {
  try {
    const response = await api.get<{ data: { players: Player[] } }>(
      "/api/players",
    );
    return response.data.data.players;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}

export default async function Home() {
  const data = await getPlayers();
  return (
    <div className="h-screen grid grid-rows-[10px_1fr_160px] items-center justify-items-center gap-16">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="mx-auto"
          src="/ul2.png"
          alt="ul logo"
          width={180}
          height={180}
          priority
        />
        {data && <SearchComponent allPlayers={data} />}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
