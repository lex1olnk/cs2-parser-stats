// Форма ответа POST /api/users/batch. Это чистые типы, а не классы:
// объекты собираются литералами, конструктор никому не нужен.

export interface ParticipantResponseDto {
  id: string;
  profileId: number;
  profileName: string;
  draftOrder: number;
}

export interface TeamResponseDto {
  id: string;
  captainId: number;
  participants: ParticipantResponseDto[];
}

export interface AddParticipantsResponseDto {
  message: string;
  teams: TeamResponseDto[];
  totalParticipants: number;
  totalTeams: number;
}
