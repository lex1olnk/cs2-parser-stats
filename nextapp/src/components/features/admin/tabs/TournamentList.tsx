import { useStore } from "@/store";
import React, { useEffect } from "react";

const TournamentList: React.FC = () => {
  const { tournaments, fetchTournaments, setShowTournamentForm } = useStore();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const statusColors: Record<string, string> = {
    upcoming: "bg-yellow-100 text-yellow-800",
    ongoing: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
  };

  const getStatusColor = (status?: string): string => {
    return statusColors[status || "upcoming"] || statusColors.upcoming;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tournaments</h2>
        <button
          onClick={() => setShowTournamentForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
        >
          <span>+ Create Tournament</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition duration-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {tournament.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    tournament.status
                  )}`}
                >
                  {tournament.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {tournament.createdAt.toLocaleDateString()}
                  </span>
                </div>

                <div className="flex space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600">Teams:</span>
                    <span className="ml-1">{tournament.teams?.length}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600">
                      Participants:
                    </span>
                    <span className="ml-1">
                      {tournament.participants?.length}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600">Matches:</span>
                    <span className="ml-1">{tournament.matches?.length}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 rounded-lg transition duration-200 font-medium">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-4 rounded-lg transition duration-200 font-medium">
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TournamentList;
