import type { StateCreator } from "zustand";
import type { Tournament, CreateTournamentData, ApiState } from "@/types";
import { createTournament, deleteTournament, getTournaments } from "@/services";

export interface TournamentSlice extends ApiState {
  tournaments: Tournament[];

  // Действия
  addTournament: (data: CreateTournamentData) => Promise<void>;
  fetchTournaments: () => Promise<void>;
  /*updateTournament: (
    id: string,
    data: Partial<CreateTournamentData>
  ) => Promise<void>;*/
  deleteTournament: (id: string) => Promise<void>;
  setTournaments: (tournaments: Tournament[]) => void;
  clearError: () => void;
}

export const createTournamentSlice: StateCreator<
  TournamentSlice,
  [],
  [],
  TournamentSlice
> = (set, get) => ({
  // Начальное состояние
  tournaments: [],
  loading: false,
  error: null,

  // Действия
  addTournament: async (data: CreateTournamentData) => {
    set({ loading: true, error: null });

    try {
      const newTournament = await createTournament(data);

      set((state) => ({
        tournaments: [...state.tournaments, newTournament],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to create tournament:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create tournament",
        loading: false,
      });
      throw error; // Пробрасываем ошибку для обработки в компонентах
    }
  },

  fetchTournaments: async () => {
    set({ loading: true, error: null });

    try {
      const tournaments = await getTournaments();
      console.log(tournaments);
      set({
        tournaments,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch tournaments",
        loading: false,
      });
    }
  },
  /*
  updateTournament: async (id: string, data: Partial<CreateTournamentData>) => {
    set({ loading: true, error: null });

    try {
      const updatedTournament = await updateTournament(
        id,
        data
      );

      set((state) => ({
        tournaments: state.tournaments.map((t) =>
          t.id === id ? { ...t, ...updatedTournament } : t
        ),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to update tournament:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tournament",
        loading: false,
      });
    }
  },
*/
  deleteTournament: async (id: string) => {
    set({ loading: true, error: null });

    try {
      await deleteTournament(id);

      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to delete tournament:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete tournament",
        loading: false,
      });
    }
  },

  setTournaments: (tournaments: Tournament[]) => {
    set({ tournaments });
  },

  clearError: () => {
    set({ error: null });
  },
});
