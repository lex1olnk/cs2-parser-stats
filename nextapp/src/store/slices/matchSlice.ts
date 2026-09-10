import type { StateCreator } from "zustand";
import type { ApiState, MatchInput, MatchNew } from "@/types";
import type { MatchQueryParams } from "@/types/match";
import { createMatches, getMatches } from "@/services/client";

interface CreateMatchData {
  matches: MatchInput[];
}

export interface MatchSlice extends ApiState {
  matches: MatchNew[];
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  /** Совпадает с тем, что читает `GET /api/matches` — см. MatchQueryParams. */
  filters: MatchQueryParams;
  recentSessionIds: string[];
  // Действия
  addMatches: (data: CreateMatchData) => Promise<void>;
  fetchMatches: (filter: Partial<MatchSlice["filters"]>) => Promise<void>;
  //updateMatch: (matchId: string, updates: Partial<Match>) => Promise<void>;
  //deleteMatch: (matchId: string) => Promise<void>;

  setFilters: (filters: Partial<MatchSlice["filters"]>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<MatchSlice["pagination"]>) => void;
  clearError: () => void;

  addRecentSession: (sessionId: string) => void;
  clearRecentSession: (sessionId: string) => void;
  clearRecentSessions: () => void;
}

export const createMatchSlice: StateCreator<MatchSlice, [], [], MatchSlice> = (
  set,
  get,
) => ({
  // Начальное состояние
  recentSessionIds: [],
  matches: [],
  loading: false,
  error: null,

  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },

  filters: {
    page: 1,
    limit: 10,
    sortBy: "startedAt",
    sortOrder: "desc",
  },

  addRecentSession: (sessionId: string) => {
    set((state) => ({
      recentSessionIds: [...state.recentSessionIds, sessionId],
    }));

    // Автоматически очищаем через 5 минут
    setTimeout(
      () => {
        get().clearRecentSession(sessionId);
      },
      5 * 60 * 1000,
    );
  },

  clearRecentSession: (sessionId: string) => {
    set((state) => ({
      recentSessionIds: state.recentSessionIds.filter((id) => id !== sessionId),
    }));
  },

  clearRecentSessions: () => {
    set({ recentSessionIds: [] });
  },
  addMatches: async (data: CreateMatchData) => {
    set({ loading: true, error: null });

    try {
      const newMatches = await createMatches(data);

      set((state) => ({
        matches: [...state.matches, ...newMatches],
        loading: false,
      }));

      console.log(`Успешно добавлено ${newMatches.length} матчей!`);
    } catch (error) {
      console.error("Failed to create matches:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to create matches",
        loading: false,
      });
      throw error;
    }
  },
  // Действия
  fetchMatches: async (filters = {}) => {
    set({ loading: true, error: null });

    try {
      // Обновляем фильтры если переданы
      if (Object.keys(filters).length > 0) {
        set({ filters: { ...get().filters, ...filters } });
      }

      // Запрос идёт по накопленному состоянию фильтров, а не по одному
      // переданному куску: иначе смена страницы теряла выбранный турнир.
      const response = await getMatches(get().filters);

      set({
        matches: response.data,
        pagination: {
          currentPage: response.pagination.page,
          pageSize: response.pagination.limit,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        },
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch matches",
        loading: false,
      });
    }
  },

  setFilters: (newFilters) => {
    // Смена фильтра всегда возвращает на первую страницу: иначе можно
    // остаться на пятой там, где после отбора осталось две.
    get().fetchMatches({ ...newFilters, page: 1 });
  },

  clearFilters: () => {
    set({
      filters: { page: 1, limit: 10, sortBy: "startedAt", sortOrder: "desc" },
    });
    get().fetchMatches({});
  },

  setPagination: (paginationUpdates) => {
    set((state) => ({
      pagination: { ...state.pagination, ...paginationUpdates },
    }));
  },

  clearError: () => {
    set({ error: null });
  },
});
