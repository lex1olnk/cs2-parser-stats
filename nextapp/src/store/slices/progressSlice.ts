// store/progress-slice.ts
import { StateCreator } from "zustand";
import { ProcessingProgress } from "@/types";

export interface ProgressSlice {
  currentSessionId: string | null;
  processingProgress: ProcessingProgress | null;
  isProgressLoading: boolean;
  progressError: string | null;
  setCurrentSessionId: (sessionId: string | null) => void;
  setProcessingProgress: (progress: ProcessingProgress | null) => void;
  setIsProgressLoading: (loading: boolean) => void;
  setProgressError: (error: string | null) => void;
  fetchProgress: (sessionId: string) => Promise<void>;
  clearProgress: () => void;
  startProgressPolling: (sessionId: string) => () => void;
}

export const createProgressSlice: StateCreator<ProgressSlice> = (set, get) => ({
  // Initial state
  currentSessionId: null,
  processingProgress: null,
  isProgressLoading: false,
  progressError: null,

  // Actions
  setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  setIsProgressLoading: (loading) => set({ isProgressLoading: loading }),
  setProgressError: (error) => set({ progressError: error }),

  fetchProgress: async (sessionId: string) => {
    const { setProcessingProgress, setIsProgressLoading, setProgressError } =
      get();

    try {
      setIsProgressLoading(true);
      const response = await fetch(`/api/matches/progress/${sessionId}`);

      if (!response.ok) throw new Error("Failed to fetch progress");

      const progress = await response.json();
      setProcessingProgress(progress);
      setProgressError(null);
    } catch (error) {
      setProgressError("err");
      console.error("Error fetching progress:", error);
    } finally {
      setIsProgressLoading(false);
    }
  },

  clearProgress: () =>
    set({
      currentSessionId: null,
      processingProgress: null,
      progressError: null,
      isProgressLoading: false,
    }),

  // Автоматический опрос прогресса
  startProgressPolling: (sessionId: string) => {
    const { fetchProgress } = get();

    // Первый запрос сразу
    fetchProgress(sessionId);

    // Интервал для опроса
    const interval = setInterval(() => {
      const currentProgress = get().processingProgress;

      // Прекращаем опрос если все завершено или ошибка
      if (
        currentProgress?.status === "completed" ||
        currentProgress?.status === "error"
      ) {
        clearInterval(interval);
        return;
      }

      fetchProgress(sessionId);
    }, 2000);

    // Возвращаем функцию для очистки
    return () => clearInterval(interval);
  },
});
