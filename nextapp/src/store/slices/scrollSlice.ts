import { StateCreator } from "zustand";
import { motionValue, MotionValue } from "framer-motion";

export interface ScrollSlice {
  scrollYProgress: MotionValue<number>;
  activeSection: number;
  setScrollYProgress: (value: MotionValue<number>) => void;
  setActiveSection: (index: number) => void;
}

export const createScrollSlice: StateCreator<ScrollSlice> = (set) => ({
  scrollYProgress: motionValue(0),
  activeSection: 0,
  setScrollYProgress: (value) => set({ scrollYProgress: value }),
  setActiveSection: (index) => set({ activeSection: index }),
});
