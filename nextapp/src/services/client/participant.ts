import { api } from "./api";

export interface AddParticipantsData {
  tournamentId: string;
  distribution: {
    [teamName: string]: string[];
  };
}

export interface ParticipantResponse {
  id: string;
  profileId: number;
  profileName: string;
  draftOrder: number;
}

export interface TeamResponse {
  id: string;
  name: string;
  captainId: number;
  participants: ParticipantResponse[];
}

export interface AddParticipantsResponse {
  message: string;
  teams: TeamResponse[];
  totalParticipants: number;
  totalTeams: number;
}

export const participantService = {
  async addParticipants(
    data: AddParticipantsData
  ): Promise<AddParticipantsResponse> {
    // Преобразуем данные в формат, ожидаемый бэкендом
    const requestData = {
      tournamentId: data.tournamentId,
      distribution: Object.fromEntries(
        Object.entries(data.distribution).map(([teamName, players]) => [
          teamName,
          { players },
        ])
      ),
    };

    const response = await api.post<AddParticipantsResponse>(
      "/users/batch",
      requestData
    );
    return response.data;
  },

  async getTournamentParticipants(tournamentId: string) {
    const response = await api.get(`/users/tournament/${tournamentId}`);
    return response.data;
  },

  async removeParticipant(participantId: string) {
    await api.delete(`/users/${participantId}`);
  },
};
