export class ParticipantResponseDto {
  id: string;
  profileId: number;
  profileName: string;
  draftOrder: number;
}

export class TeamResponseDto {
  id: string;
  captainId: number;
  participants: ParticipantResponseDto[];
}

export class AddParticipantsResponseDto {
  message: string;
  teams: TeamResponseDto[];
  totalParticipants: number;
  totalTeams: number;
}
