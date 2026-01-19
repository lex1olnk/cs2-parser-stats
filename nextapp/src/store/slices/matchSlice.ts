import type { StateCreator } from "zustand";
import type { ApiState, MatchesResponse, MatchInput, MatchNew } from "@/types";
import { createMatches, getMatches } from "@/services";

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
  filters: {
    skip?: number;
    take?: number;
    include?: string;
    orderBy?: string;
    where?: string;
  };
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
  get
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
    take: 10,
    skip: 0,
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
      5 * 60 * 1000
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
  fetchMatches: async (filters = { take: 10, skip: 0 }) => {
    set({ loading: true, error: null });

    try {
      // Обновляем фильтры если переданы
      if (Object.keys(filters).length > 0) {
        set({ filters: { ...get().filters, ...filters } });
      }

      const currentFilters = get().filters;
      const skip = filters.skip;

      const params = {
        skip,
        take: filters.take,
        include: currentFilters.include,
        where: currentFilters.where,
        orderBy: currentFilters.orderBy,
      };

      const response = await getMatches(params);

      set({
        matches: response.data,
        pagination: {
          currentPage: response.pagination.page / 10,
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
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));

    // Автоматически применяем фильтры с первой страницы
    get().fetchMatches(newFilters);
  },

  clearFilters: () => {
    set({
      filters: {},
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
