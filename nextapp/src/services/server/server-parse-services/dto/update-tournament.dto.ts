import { CreateTournamentDto } from "./create-tournament.dto";

export interface UpdateTournamentDto extends CreateTournamentDto {
  mvpId: number;
}
