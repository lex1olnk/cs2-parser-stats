import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  createTournamentSlice,
  type TournamentSlice,
  createMatchSlice,
  type MatchSlice,
  createUISlice,
  type UISlice,
  createProfileSlice,
  type ProfileSlice,
  createParticipantSlice,
  type ParticipantSlice,
  createProgressSlice,
  ProgressSlice,
} from "./slices";

// Объединяем все слайсы в один тип
export type StoreState = TournamentSlice &
  MatchSlice &
  UISlice &
  ProfileSlice &
  ParticipantSlice &
  ProgressSlice;

// Создаем главный store
export const useStore = create<StoreState>()(
  devtools(
    (...a) => ({
      ...createTournamentSlice(...a),
      ...createMatchSlice(...a),
      ...createUISlice(...a),
      ...createProfileSlice(...a),
      ...createParticipantSlice(...a),
      ...createProgressSlice(...a),
    }),
    {
      name: "store",
    }
  )
);
