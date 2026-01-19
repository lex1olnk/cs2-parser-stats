"use client";

import { useEffect, useState } from "react";

interface Tournament {
  id: string;
  name: string;
}

interface TournamentSearchProps {
  allTournaments: Tournament[];
  setNewTournamentName: (name: string) => void;
  setNewTournamentId: (id: string) => void;
}

export const TournamentSearch = ({
  allTournaments,
  setNewTournamentName,
  setNewTournamentId,
}: TournamentSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>(
    []
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
      tournament.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setNewTournamentName(searchTerm);
    setFilteredTournaments(filtered);
  }, [searchTerm, allTournaments, setNewTournamentName]);

  const handleSelectTournament = (tournament: Tournament) => {
    setSearchTerm(tournament.name);
    setSelectedTournamentId(tournament.id);
    setNewTournamentId(tournament.id);
    setNewTournamentName(tournament.name);
    setFilteredTournaments([]);
  };

  const clearSelection = () => {
    setSearchTerm("");
    setNewTournamentId("");
    setNewTournamentName("");
    setSelectedTournamentId(null);
  };

  return (
    <div className="relative">
      <div className="flex mx-auto">
        <input
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          type="text"
          className="rounded-none rounded-e-lg border bg-light-dark block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5 dark:placeholder-gray-400"
          placeholder="Search tournament"
        />
        {searchTerm && (
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
