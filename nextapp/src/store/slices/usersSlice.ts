import { type StateCreator } from "zustand";
import type {
  Profile,
  ApiState,
  PaginationParams,
  ProfilesResponse,
} from "@/types";
import { addProfiles, getProfiles, getProfilesCount } from "@/services";
import { api } from "@/lib/api";

export interface ProfileSlice extends ApiState {
  profiles: Profile[];
  totalProfiles: number;
  loadingTotalCount: boolean;
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
  };

  // Действия
  fetchProfiles: (page?: number, pageSize?: number) => Promise<void>;
  /*fetchTotalProfilesCount: () => Promise<void>;*/
  setProfiles: (profiles: Profile[]) => void;
  setPagination: (pagination: Partial<ProfileSlice["pagination"]>) => void;
  addProfiles: (
    formData: {
      name: string;
      email: string | null;
      faceitLink: string | null;
      users: {
        id: number;
        nickname: string;
      }[];
    }[]
  ) => void;
  clearError: () => void;
}

export const createProfileSlice: StateCreator<
  ProfileSlice,
  [],
  [],
  ProfileSlice
> = (set, get) => ({
  // Начальное состояние
  profiles: [],

  loading: false,
  error: null,
  totalProfiles: 0,
  loadingTotalCount: false,
  pagination: {
    currentPage: 1,
    pageSize: 10,
    total: 0,
  },

  // Действия
  fetchProfiles: async (page = 1, pageSize = 10) => {
    set({ loading: true, error: null });

    try {
      const params = { limit: pageSize, page };

      const response: ProfilesResponse = await getProfiles(params);

      set({
        profiles: response.data,
        pagination: {
          currentPage: response.pagination.page,
          pageSize,
          total: response.pagination.totalPages,
        },
        totalProfiles: response.pagination.total,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch profiles",
        loading: false,
      });
    }
  },

  addProfiles: async (
    data: {
      name: string;
      email: string | null;
      faceitLink: string | null;
      users: {
        id: number;
        nickname: string;
      }[];
    }[]
  ) => {
    set({ loading: true, error: null });

    try {
      const response = await addProfiles(data);

      set({ loading: false });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add participants";

      set({
        error: errorMessage,
        loading: false,
      });

      throw new Error(errorMessage);
    }
  },
  /*


  fetchTotalProfilesCount: async () => {
    set({ loadingTotalCount: true });

    try {
      const totalProfiles = await getProfilesCount();
      const totalPages = Math.ceil(totalProfiles / 10);
      set({
        pagination:,
        loadingTotalCount: false,
      });
    } catch (error) {
      console.error("Failed to fetch total count:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch total count",
        loadingTotalCount: false,
      });
    }
  },
*/
  setProfiles: (profiles: Profile[]) => {
    set({ profiles });
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
