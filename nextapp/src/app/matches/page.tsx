import PlayersTable from "@/components/features/matches/PlayersTable";
import { getTournaments } from "../upload/api";
import { getMatches } from "./_api/api";

export const revalidate = 3600;

export default async function PlayersStatsPage() {
  const players = await getMatches();
  const tournaments = await getTournaments();

  if (players.length > 0) {
    players.map((player) => {
      player.headshots = (player.headshots / player.kills) * 100;
      player.kast = (player.kast / player.rounds) * 100;
    });
    players.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div>
      <div className="players-stats-container">
        <h1 className="my-8 text-center text-5xl">ULMIX STATS</h1>

        {players && tournaments && (
          <PlayersTable players={players} ulTournaments={tournaments} />
        )}
      </div>
    </div>
  );
}
