import type {
  ClutchStats,
  CreateTournamentData,
  Tournament,
  WeaponStats,
} from "@/types";
import { api, getData } from "./api";

// Типы для API
interface CreateTournamentRequest {
  name: string;
  status: string;
}

interface TournamentResponse {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const mapStatusToApi = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    upcoming: "1",
    ongoing: "2",
    completed: "3",
  };
  return statusMap[status] || "1";
};

// Преобразование статуса из формата API в наш формат
const mapStatusFromApi = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    "1": "upcoming",
    "2": "ongoing",
    "3": "completed",
  };
  return statusMap[status] || "upcoming";
};

export const createTournament = async (data: CreateTournamentData) => {
  const response = await api.post<TournamentResponse>("/tournaments", data);

  return {
    id: response.data.id,
    name: response.data.name,
    status: mapStatusToApi(response.data.status),
    createdAt: new Date(response.data.createdAt),
    updatedAt: new Date(response.data.updatedAt),
    participants: [],
    teams: [],
    matches: [],
  };
};

// Получение всех турниров
export const getTournaments = async (): Promise<Tournament[]> => {
  const response = await api.get<TournamentResponse[]>("/tournaments");
  console.log(response.data);
  return response.data.map((item) => ({
    id: item.id,
    name: item.name,
    status: mapStatusFromApi(item.status),
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
    participants: [],
    teams: [],
    matches: [],
  }));
};

// Удаление турнира
export const deleteTournament = async (id: string): Promise<void> => {
  await api.delete(`/tournaments/${id}`);
};

export const getGraphWeapons = async (
  playerId: number,
  tournamentId: string | null
): Promise<WeaponStats[]> => {
  const response = await api.get<{ weapons: WeaponStats[] }>(`/stats/weapon`, {
    params: {
      playerId,
      tournamentId: tournamentId ?? undefined,
    },
  });

  return response.data.weapons;
};

export const getClutchStats = async (
  playerId: number,
  tournamentId: string | null
): Promise<ClutchStats[]> => {
  const response = await api.get<{ clutch: ClutchStats[] }>(`/stats/clutch`, {
    params: {
      playerId,
      tournamentId: tournamentId ?? undefined,
    },
  });

  return response.data.clutch;
};

export const getStatsData = async (
  playerId: number,
  tournamentId: string | null
) => {
  const response = await api.get(`/stats/stats`, {
    params: {
      playerId,
      tournamentId,
    },
  });

  return response.data;
};
