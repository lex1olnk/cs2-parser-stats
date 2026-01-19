import MatchImporter from "@/components/tournaments/MatchImporter";
import { getTournaments } from "./api";

export const dynamic = 'force-dynamic'; // Важно!
export const revalidate = 0; // Отключает ISR

export default async function UploadMatchesPage() {
  const tournaments = await getTournaments();

  return (
    <div>
      <MatchImporter tournaments={tournaments} />
    </div>
  );
}
