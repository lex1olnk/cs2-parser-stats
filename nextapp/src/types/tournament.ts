import type { Match, Profile } from "@/types";

export interface CreateTournamentData {
  name: string;
  status: "upcoming" | "ongoing" | "completed";
  mvpId?: number;
}

export interface Tournament {
  id: string;
  name: string;
  status?: "upcoming" | "ongoing" | "completed" | string;
  createdAt: Date;
  updatedAt?: Date;
  participants?: TournamentParticipant[];
  teams?: TournamentTeam[];
  matches?: Match[];
  mvp?: Profile;
  mvpId?: number;
}

export interface TournamentTeam {
  id: string;
  name?: string;
  seed?: number;
  tournamentId: string;
  captainId: number;
  tournament: Tournament;
  captain: Profile;
  participants?: TournamentParticipant[];
}

export interface TournamentParticipant {
  id: string;
  profileId: number;
  tournamentId: string;
  tournamentTeamId?: string;
  draftOrder?: number;
  profile: Profile;
  tournament: Tournament;
  team?: TournamentTeam;
}

export interface WeaponStats {
  name: string;
  kills: number;
  topPlayer: {
    name: string;
    kills: number;
  };
  icon: string;
}

export interface ClutchStats {
  type: string;
  successRate: number;
  totalAttempts: number;
  topPlayer: {
    name: string;
    successRate: number;
    attempts: number;
  };
}

export interface EntryStats {
  topPlayer: {
    name: string;
    successRate: number;
    totalEntries: number;
    successfulEntries: number;
  };
  weaponBreakdown: Array<{
    weapon: string;
    percentage: number;
  }>;
}

export interface TournamentData {
  weapons: WeaponStats[];
  clutches: ClutchStats[];
  entry: EntryStats;
}

export interface WeaponStats {
  weapon: string;
  kills: number;
  wallbang: number;
  headshot: number;
  airshot: number;
  noscope: number | null;
}

export interface ClutchStats {
  amount: number; // 1v1, 1v2, 1v3, 1v4, 1v5
  success: boolean;
  count: number;
}
