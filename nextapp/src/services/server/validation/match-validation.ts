// lib/validation/match-validation.ts
import { MatchInput } from "@/types/demo-processing";

export function validateMatchInput(match: unknown): match is MatchInput {
  if (typeof match !== "object" || match === null) {
    throw new Error("Invalid match: must be an object");
  }

  // Платформа "local" здесь намеренно не принимается: этот валидатор
  // проверяет пользовательский ввод для загрузки по ссылке, а импорт из
  // папки идёт своим роутом.
  const candidate = match as Partial<MatchInput>;

  if (!candidate.url || typeof candidate.url !== "string") {
    throw new Error("Invalid URL: must be a string");
  }

  if (
    !candidate.platform ||
    !["fastcup", "cybershoke"].includes(candidate.platform)
  ) {
    throw new Error("Invalid platform: must be fastcup or cybershoke");
  }

  if (
    candidate.tournamentId !== null &&
    typeof candidate.tournamentId !== "string"
  ) {
    throw new Error("Invalid tournamentId: must be string or null");
  }

  if (typeof candidate.isFinal !== "boolean") {
    throw new Error("Invalid isFinal: must be boolean");
  }

  return true;
}

export function validateMatchesInput(
  matches: unknown
): matches is MatchInput[] {
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
