import { Match } from "./types";

// types/demo-processing.ts
export interface MatchInput {
  url: string;
  tournamentId: string | null;
  isFinal: boolean;
  // "local" — демка уже лежала в shared-demos, скачивание не выполнялось.
  platform: "fastcup" | "cybershoke" | "local";
}

export interface ProcessingSession {
  sessionId: string;
  status: "processing" | "completed" | "error";
  totalMatches: number;
  processedMatches: number;
  matches: MatchProgress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProcessingProgress {
  sessionId: string;
  status: "processing" | "completed" | "error";
  totalMatches: number;
  processedMatches: number;
  overallProgress: number;
  matches: MatchProgress[];
}

export interface MatchProgress {
  url: string;
  // Тот же тип, что у MatchInput.tournamentId: матч может быть вне турнира.
  tournamentId?: string | null;
  // "local" — демка уже лежала в shared-demos, скачивание не выполнялось.
  platform: "fastcup" | "cybershoke" | "local";
  status: "pending" | "downloading" | "parsing" | "completed" | "error";
  progress: number; // 0-100
  currentStep?: string;
  demoPath?: string;
  matchId?: string;
  error?: string;
  data?: Match;
}
