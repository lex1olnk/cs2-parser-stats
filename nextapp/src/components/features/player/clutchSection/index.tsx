import { getClutchStats } from "@/services/client";
import { ClutchView } from "./ClutchView";

export async function ClutchSection({
  playerId,
  tournamentId,
}: {
  playerId: number;
  tournamentId: string | null;
}) {
  const clutchStats = await getClutchStats(playerId, tournamentId);

  return <ClutchView data={clutchStats} />;
}

export { ClutchSkeleton } from "./ClutchSkeleton";
