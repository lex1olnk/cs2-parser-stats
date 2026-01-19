import StatsView from "./StatsView";

export async function StatsSection({
  playerId,
  tournamentId,
}: {
  playerId: number;
  tournamentId: string | null;
}) {
  // const statStats = await getStatsInfo(playerId, tournamentId);

  return <StatsView stats={[]} moreStats={[]} />;
}
