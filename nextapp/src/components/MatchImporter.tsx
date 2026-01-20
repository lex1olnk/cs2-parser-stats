"use client";
import {
  createTournament,
  exportMatches,
  postAndAttachMatches,
  updateTournamentPlayers,
} from "@/app/upload/api";
import { useState } from "react";
import { TournamentSearch } from "./TournamentSearch";

export default function MatchImporter({
  tournaments,
}: {
  tournaments: {
    id: string;
    name: string;
  }[];
}) {
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [matchUrls, setMatchUrls] = useState<string>("");
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState("");
  const handleSubmit = async () => {
    // Извлечение ID матчей из URL
    const matchIds = matchUrls.split(/[\n,]+/);

    if (matchIds.length === 0) {
      alert("Please enter valid match URLs");
      return;
    }

    try {
      // Отправка данных на сервер
      const response = await postAndAttachMatches({
        tournamentId: selectedTournament,
        matchUrls: matchIds,
      });
      alert(response);
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing matches");
    }
  };

  const handleCreateTournament = async () => {
    if (!newTournamentName) {
      alert("Please enter tournament name");
      return;
    }

    try {
      const id = await createTournament(newTournamentName);
      setIsCreatingTournament(false);
      setSelectedTournament(id);
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Error creating tournament");
    }
  };

  const handleUpdateTournamentPlayers = async () => {
    if (!newTournamentName) {
      alert("Please enter tournament name");
      return;
    }

    try {
      await updateTournamentPlayers(selectedTournament, newTournamentName);
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Error creating tournament");
    }
  };

  const handleExportMatches = async () => {
    if (!newTournamentName) {
      alert("Please enter tournament name");
      return;
    }

    try {
      await exportMatches({
        tournamentId: selectedTournament,
        tournamentName: newTournamentName,
      });
    } catch (error) {
      console.error("Error creating tournament:", error);
      alert("Error creating tournament");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Import Fastcup Matches</h1>

      {/* Блок управления турнирами */}
      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between gap-4 mb-4">
          <TournamentSearch
            allTournaments={tournaments}
            setNewTournamentName={setNewTournamentName}
            setNewTournamentId={setSelectedTournament}
          />
          <div>
            <button
              onClick={handleCreateTournament}
              className="px-4 py-2  bg-slate-300 hover:bg-white text-black rounded"
            >
              {isCreatingTournament ? "Loading" : "Create New"}
            </button>

            {selectedTournament && (
              <>
                <button
                  onClick={handleUpdateTournamentPlayers}
                  className="ml-4 px-4 py-2 rounded bg-slate-300 hover:bg-white text-black"
                >
                  Update Players
                </button>
                <button
                  onClick={handleExportMatches}
                  className="ml-4 px-4 py-2 rounded bg-slate-300 hover:bg-white text-black"
                >
                  Export Matches
                </button>
              </>
            )}
          </div>
        </div>
        <p className="text-xs">id: {selectedTournament}</p>
      </div>

      {/* Поле для ввода ссылок */}
      <div className="mb-6">
        <textarea
          value={matchUrls}
          onChange={(e) => setMatchUrls(e.target.value)}
          placeholder="Enter match URLs (one per line or comma separated)"
          rows={8}
          className="w-full p-4 bg-gray-800 rounded-lg font-mono text-sm"
        />
      </div>

      {/* Кнопка отправки */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-slate-300 hover:bg-white rounded-lg font-bold text-black"
      >
        Process Matches
      </button>
    </div>
  );
}
