"use client";
import React, { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useStore } from "@/store";

export function HybridScroll({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const setScrollYProgress = useStore((state) => state.setScrollYProgress);
  const setActiveSection = useStore((state) => state.setActiveSection);

  useEffect(() => {
    setScrollYProgress(scrollYProgress);
  }, [scrollYProgress, setScrollYProgress]);

  // Следим за прогрессом и вычисляем активную секцию (для 5 секций)
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const sectionIndex = Math.floor(latest * 5); // 5 — общее кол-во секций
    setActiveSection(sectionIndex);
  });

  const x = useTransform(
    scrollYProgress,
    [0, 0.75, 0.9, 1],
    ["0vw", "-400vw", "-400vw", "-400vw"],
  );

  return (
    <div ref={containerRef} className="relative h-[800vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div style={{ x }} className="flex h-full w-max">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
