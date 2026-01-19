import type { StateCreator } from "zustand";
import type { ApiState } from "@/types";
import { participantService } from "@/services";

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

export interface ParticipantSlice extends ApiState {
  // Действия
  addParticipants: (data: AddParticipantsData) => Promise<ParticipantResponse>;
  clearError: () => void;
}

export const createParticipantSlice: StateCreator<
  ParticipantSlice,
  [],
  [],
  ParticipantSlice
> = (set, get) => ({
  // Начальное состояние
  loading: false,
  error: null,

  // Действия
  addParticipants: async (data: AddParticipantsData) => {
    set({ loading: true, error: null });

    try {
      const response = await participantService.addParticipants(data);

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

  clearError: () => {
    set({ error: null });
  },
});
