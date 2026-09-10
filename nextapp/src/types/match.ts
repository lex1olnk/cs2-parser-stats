export interface MatchNew {
  id: string;
  url: string;
  tournamentId?: string;
  tournament?: {
    id: string;
    name: string;
    status: string;
  };
  platform: "fastcup" | "cybershoke";
  isFinal: boolean;
  // В БД это Int, роут отдаёт число как есть — тип обещал строку зря.
  bestOf: number;
  type?: string;
  status: "pending" | "downloading" | "parsing" | "completed" | "error";
  startedAt: string;
  updatedAt: string;
  text: string;
  teams: string[];
}

export interface AdminMatchesResponse {
  data: MatchNew[];
  filters: {
    status: null | string;
    tournamentId: null | string;
    type: null | string;
    dateFrom: null | string;
  };
  pagination: {
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
    nextPage: number;
    page: number;
    prevPage: number | null;
    total: number;
    totalPages: number;
  };
}

export interface MatchesResponse {
  matches: MatchNew[];
  total: number;
  skip: number;
  take: number;
}

/**
 * Параметры списка матчей — ровно те, что читает `GET /api/matches`.
 *
 * Раньше здесь были `skip`/`take`/`where`/`orderBy` в виде JSON-строк, но роут
 * их не читает вообще: он берёт `page`/`limit` и отдельные поля фильтра.
 * Из-за расхождения пагинация в админке не работала — кнопка «вперёд» меняла
 * `skip`, а сервер молча отдавал ту же первую страницу.
 *
 * Имена полей сортировки на сервере проходят через белый список, поэтому
 * произвольное поле сюда подставлять бессмысленно — оно молча заменится
 * на `createdAt`.
 */
export interface MatchQueryParams {
  page?: number;
  limit?: number;
  tournamentId?: string;
  status?: string;
  type?: string;
  /** Дата в формате YYYY-MM-DD; отбирает матчи, начатые не раньше неё. */
  dateFrom?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface MatchTeam {
  id: number;
  name: string;
  size: number;
  score: number;
  isWinner: boolean;
  captainId: number;
  isDisqualified: boolean;
  matchId: number;
}

export interface MatchMember {
  hash: string;
  role: string;
  ready: boolean;
  impact?: number;
  connected: boolean;
  isLeaver: boolean;
  ratingDiff?: number;
  matchId?: number;
  matchTeamId?: number;
  userId?: number;
}

export interface MatchItem {
  id: string;
  url: string;
  status: string;
  progress: number;
  currentStep: string;
  error?: string;
}
