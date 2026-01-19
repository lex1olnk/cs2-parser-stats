"use server"

import { api, getBaseUrl } from "@/lib/api";

interface PlayerStats {
  playerID: number;
  nickname: string;
  uLRating: number;
  pick_number: number;
  img: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  kast: number;
  damage: number;
  exchanged: number;
  firstDeaths: number;
  firstKills: number;
  multiKills: number[];
  clutches: number[];
  rounds: number;
  ul_id: string | null;
  teamID: number;
  kpr: number;
  dpr: number;
  impact: number;
  clutchExp: number;
  rating: number;
  matchID: number;
  is_winner: boolean;
  date: string;
}

export async function getMatches() {
  try {
    const response = await api.get<{ Players: PlayerStats[] }>("/api/matches");
    return response.data.Players;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}

export async function getPlayerMatches(id: string, ul_id: string, page: number) {
  try {
    const response = await fetch(`${getBaseUrl}/api/player/${id}/matches?ul_id=${ul_id}&page=${page}`, {
      cache: 'no-store', // Отключает кеширование
    })

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Возвращаем пустые данные вместо исключения
  }
}