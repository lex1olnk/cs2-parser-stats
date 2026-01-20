import { StateCreator } from "zustand";
import { MotionValue } from "framer-motion";

export interface ScrollSlice {
  scrollYProgress: MotionValue<number> | null;
  activeSection: number;
  setScrollYProgress: (value: MotionValue<number>) => void;
  setActiveSection: (index: number) => void;
}

export const createScrollSlice: StateCreator<ScrollSlice> = (set) => ({
  scrollYProgress: null,
  activeSection: 0,
  setScrollYProgress: (value) => set({ scrollYProgress: value }),
  setActiveSection: (index) => set({ activeSection: index }),
});
