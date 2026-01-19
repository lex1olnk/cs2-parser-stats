import { platform } from "os";
import { api } from "./api";
import type {
  AdminMatchesResponse,
  MatchInput,
  MatchNew,
  MatchQueryParams,
} from "@/types";

export const createMatches = async (data: {
  matches: MatchInput[];
}): Promise<MatchNew[]> => {
  // Преобразуем данные из нашего формата в формат API
  const requestData = {
    matches: data.matches.map((matchInput: MatchInput) => ({
      url: matchInput.url,
      tournamentId:
        matchInput.tournamentId == "" ? null : matchInput.tournamentId,
      isFinal: matchInput.isFinal,
      platform: matchInput.platform,
    })),
  };
  console.log(requestData);
  const response = await api.post("/matches", requestData);
  return [];
  // Преобразуем ответ API в наш внутренний формат
};

// Получение всех матчей
export const getMatches = async (
  params: MatchQueryParams
): Promise<AdminMatchesResponse> => {
  // Очищаем параметры от undefined значений
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  );

  const response = await api.get<AdminMatchesResponse>("/matches", {
    params: cleanParams,
  });

  return response.data;
};

// Получение матча по ID
export const getMatchById = async (id: string): Promise<any> => {
  const response = await api.get<MatchNew>(`/matches/${id}`);

  return {
    id: response.data.id,
    url: response.data.url,
    tournamentId: response.data.tournamentId || undefined,
    bestOf: response.data.bestOf,
    isFinal: response.data.isFinal,
    status: response.data.status,
    startedAt: response.data.startedAt,
    updatedAt: response.data.updatedAt,
    text: `${response.data.url}`,
    teams: [],
  };
};

// Обновление матча
export const updateMatch = async (
  id: string,
  updates: Partial<MatchInput>
): Promise<any> => {
  const response = await api.put<MatchNew>(`/matches/${id}`, updates);

  return {
    id: response.data.id,
    url: response.data.url,
    tournamentId: response.data.tournamentId || undefined,
    bestOf: response.data.bestOf,
    isFinal: response.data.isFinal,
    status: response.data.status,
    startedAt: response.data.startedAt,
    updatedAt: response.data.updatedAt,
    text: `${response.data.url}`,
    teams: [],
  };
};

// Удаление матча
export const deleteMatch = async (id: string): Promise<void> => {
  await api.delete(`/matches/${id}`, {
    params: { cascade: true },
  });
};
