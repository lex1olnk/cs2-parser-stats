"use client";

import { useState, useEffect } from "react";

interface Tournament {
  id: string;
  name: string;
}

interface TournamentSearchProps {
  allTournaments: Tournament[];
}

export const TournamentSearch = ({ allTournaments }: TournamentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
    [],
  );
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (searchTerm.length === 0) {
      setFilteredTournaments([]);
      return;
    }

    const filtered = allTournaments.filter((tournament) =>
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredTournaments(filtered);
  }, [searchTerm, allTournaments]);

  const handleSelectTournament = (tournament: Tournament) => {
    setSearchTerm(tournament.name);
    setSelectedTournamentId(tournament.id);
    setFilteredTournaments([]);
  };

  const clearSelection = () => {
    setSearchTerm("");
    setSelectedTournamentId(null);
  };

  return (
    <div className="relative">
      <div className="flex mx-auto">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-light-dark border rounded-e-0 border-gray-300 border-e-0 rounded-s-md">
          <svg
            className="w-4 h-4 text-light-dark"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </span>
        <input
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          type="text"
          className="rounded-none rounded-e-lg border bg-light-dark block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:placeholder-gray-400"
          placeholder="Search tournament"
        />
        {selectedTournamentId && (
          <button
            onClick={clearSelection}
            className="ml-2 px-3 text-gray-400 hover:text-gray-200"
          >
            ×
          </button>
        )}
      </div>
      {filteredTournaments.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-light-dark border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredTournaments.map((tournament) => (
            <li
              key={tournament.id}
              onClick={() => handleSelectTournament(tournament)}
              className={`px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors ${
                tournament.id === selectedTournamentId ? "bg-gray-600" : ""
              }`}
            >
              {tournament.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
