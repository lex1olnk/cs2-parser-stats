"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Player {
  id: string;
  nickname: string;
}

export const SearchComponent = ({ allPlayers }: { allPlayers: Player[] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const router = useRouter();
  // Фильтрация игроков при изменении поискового запроса
  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredPlayers([]);
      return;
    }

    const filtered = allPlayers.filter((player) =>
      player.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredPlayers(filtered);
  }, [searchTerm, allPlayers]);

  const handleSelectPlayer = (player: Player) => {
    setSearchTerm(player.nickname);
    setSelectedPlayerId(player.id);
    setFilteredPlayers([]);
    router.push(`/player/${player.id}`);
  };

  return (
    <div className="relative">
      <div className="flex mx-auto">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-light-dark border rounded-e-0 border-gray-300 border-e-0 rounded-s-md">
          <svg
            className="w-4 h-4 text-light-dark"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="white"
            viewBox="0 0 20 20"
          >
            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
          </svg>
        </span>
        <input
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          value={searchTerm}
          type="text"
          id="website-admin"
          className="rounded-none rounded-e-lg  border bg-light-dark block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5   dark:placeholder-gray-400"
          placeholder="fastcup nickname"
        />
      </div>
      {filteredPlayers.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white text-light-dark border rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              onClick={() => handleSelectPlayer(player)}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                player.id === selectedPlayerId ? "bg-blue-50" : ""
              }`}
            >
              {player.nickname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
