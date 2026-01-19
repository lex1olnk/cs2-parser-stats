import {
  IsString,
  IsObject,
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class TeamDistributionDto {
  @IsArray()
  @IsNotEmpty()
  players: string[];
}

export class AddParticipantsDto {
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => TeamDistributionDto)
  distribution: Record<string, TeamDistributionDto>;
}
