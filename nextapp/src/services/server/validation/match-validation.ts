// lib/validation/match-validation.ts
import { MatchInput } from "@/types/demo-processing";

export function validateMatchInput(match: any): match is MatchInput {
  if (!match.url || typeof match.url !== "string") {
    throw new Error("Invalid URL: must be a string");
  }

  if (!match.platform || !["fastcup", "cybershoke"].includes(match.platform)) {
    throw new Error("Invalid platform: must be fastcup or cybershoke");
  }

  if (match.tournamentId !== null && typeof match.tournamentId !== "string") {
    throw new Error("Invalid tournamentId: must be string or null");
  }

  if (typeof match.isFinal !== "boolean") {
    throw new Error("Invalid isFinal: must be boolean");
  }

  return true;
}

export function validateMatchesInput(matches: any): matches is MatchInput[] {
  if (!Array.isArray(matches)) {
    throw new Error("Matches must be an array");
  }

  if (matches.length === 0) {
    throw new Error("Matches array cannot be empty");
  }

  if (matches.length > 10) {
    // Лимит на количество матчей
    throw new Error("Too many matches. Maximum 10 per request");
  }

  matches.forEach(validateMatchInput);

  return true;
}
