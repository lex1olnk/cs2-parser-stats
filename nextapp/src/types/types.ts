// Типы для данных игрока
export interface PlayerStats {
  kd: number;
  kdTrend: number;
  kdHistory: TimeSeriesData;
  winRate: number;
  winRateTrend: number;
  winRateHistory: TimeSeriesData;
  headshotPercentage: number;
  hsTrend: number;
  matchHistory: MatchHistoryEntry[];
}

export interface TimeSeriesData {
  labels: string[];
  data: number[];
}

export interface MatchHistoryEntry {
  date: string;
  map: string;
  kills: number;
  deaths: number;
  assists: number;
  adr: number;

  won: boolean;
}

export interface Match {
  kills: number;
  map: string;
  deaths: number;
  assists: number;
  kast: number;
  damage: number;
  rounds: number;
  rating: number;
  isWinner: boolean;
  matchId: number;
  finishedAt: string;
}

// Типы для пропсов компонентов
export type TimeRange = "24h" | "7d" | "30d" | "all";

export interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  isPercentage?: boolean;
}

export interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export interface PlayerComparison {
  playerID: number;
  nickname: string;
  uLRating: number;
  img: string;
  kills: number;
  deaths: number;
  assists: number;
  firstKills: number;
  firstDeaths: number;
  kast: number;
  TargetWinrate: number;
  TargetKD: number;
  TargetHSRatio: number;
  TargetAvg: number;
  winrateAdv: number;
  kdAdv: number;
  hsAdv: number;
  avgAdv: number;
}

export interface MapStat {
  avgRating: number;
  map: string;
  matches: number;
  winrate: number;
  wins: number;
}

export interface PlayerData {
  player_stats: PlayerComparison;
  recent_matches: Match[];
  maps_stats: MapStat[];
}

export interface CreateTeamData {
  name: string;
  seed?: number;
  tournamentId: string;
  captainId: number;
}

export interface CreateParticipantData {
  profileId: number;
  tournamentId: string;
  tournamentTeamId?: string;
  draftOrder?: number;
}

// Добавим тип для состояния загрузки
export interface ApiState {
  loading: boolean;
  error: string | null;
}

export interface Profile {
  id: number;
  name: string;
  email: string | null;
  faceitLink: string;
  createdAt: string;
  userCount?: number;
  isLinkedToUsers?: boolean;
  users: Array<{ id: number }>;
}

export interface ProfilesResponse {
  data: Profile[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  take: number;
  skip: number;
}

export interface Params extends PaginationParams {
  include: any;
}

// types/profile.ts
export interface ProfileQueryParams {
  // Пагинация
  skip?: number;
  take?: number;
  // Фильтрация
  filters?: {
    hasUsers?: boolean; // Есть привязанные пользователи
    name?: string; // Поиск по имени
    id?: number; // Поиск по ID
  };
}

// Добавляем к существующим типам
export interface AddParticipantsData {
  tournamentId: string;
  distribution: {
    [teamName: string]: string[];
  };
}

export interface ParticipantResponse {
  message: string;
  teams: Array<{
    id: string;
    name: string;
    participants: Array<{
      id: string;
      profileId: number;
      profileName: string;
    }>;
  }>;
}
