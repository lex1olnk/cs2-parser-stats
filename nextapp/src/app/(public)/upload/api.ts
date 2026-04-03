"use server";

import { api } from "@/lib/api";

interface Tournament {
  id: string;
  name: string;
}

export async function getTournaments() {
  try {
    const response = await api.get<{data: Tournament[] }>(
      "/api/ultournaments",
    );
    return response.data.data;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}

export async function createTournament(name: string) {
  try {
    const response = await api.post(
      "/api/ultournaments",
      {
        name: name,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.data.tournamentId;
  } catch (error) {
    console.error("API Error:", error);
    return ""; // Возвращаем пустые данные вместо исключения
  }
}

export async function updateTournamentPlayers(id:string, name: string) {
  try {
    await api.post(
      "/api/ulpicks",
      {
        id: id,
        name: name,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return ""; // Возвращаем пустые данные вместо исключения
  }
}

export async function postAndAttachMatches({
  tournamentId,
  matchUrls,
}: {
  tournamentId: string | null;
  matchUrls: string[];
}) {
  const requestBody: { match_urls: string[]; tournament_id?: string } = {
    match_urls: matchUrls,
  };

  if (tournamentId) {
    requestBody.tournament_id = tournamentId;
  }

  try {
    const response = await api.post("/api/ulmatches", requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data.status;
  } catch (error) {
    console.error("API Error:", error);
  }
}

export async function exportMatches({
  tournamentId,
  tournamentName
}: {
  tournamentId: string | "";
  tournamentName: string;
}) {
  const requestBody: { name: string; id?: string } = {
    name: tournamentName,
  };

  if (tournamentId) {
    requestBody.id = tournamentId;
  }
  console.log(requestBody)
  try {
    const response = await api.post("/api/matches/export", requestBody, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.status;
  } catch (error) {
    console.error("API Error:", error);
  }
}
