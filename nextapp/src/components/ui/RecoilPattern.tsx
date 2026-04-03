// components/ui/RecoilPattern.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";

const AK47_RECOIL_PATTERN = [
  { x: 0, y: 0, delay: 0 },
  { x: 0, y: -20, delay: 0.05 },
  { x: 0, y: -40, delay: 0.1 },
  { x: 5, y: -65, delay: 0.15 },
  { x: -5, y: -90, delay: 0.2 },
  { x: 10, y: -110, delay: 0.25 },
  { x: -10, y: -130, delay: 0.3 },
  { x: 20, y: -140, delay: 0.35 },
  { x: -20, y: -150, delay: 0.4 },
  { x: 15, y: -160, delay: 0.45 },
  { x: -25, y: -170, delay: 0.5 },
  { x: 10, y: -180, delay: 0.55 },
  { x: -30, y: -190, delay: 0.6 },
  { x: 0, y: -200, delay: 0.65 },
  { x: 25, y: -210, delay: 0.7 },
  { x: -15, y: -220, delay: 0.75 },
  { x: 30, y: -230, delay: 0.8 },
  { x: -10, y: -240, delay: 0.85 },
  { x: 20, y: -250, delay: 0.9 },
  { x: -5, y: -260, delay: 0.95 },
  { x: 10, y: -270, delay: 1.0 },
  { x: -20, y: -280, delay: 1.05 },
  { x: 0, y: -290, delay: 1.1 },
  { x: 15, y: -300, delay: 1.15 },
  { x: -25, y: -310, delay: 1.2 },
  { x: 5, y: -320, delay: 1.25 },
  { x: -10, y: -330, delay: 1.3 },
  { x: 20, y: -340, delay: 1.35 },
  { x: -15, y: -350, delay: 1.4 },
  { x: 0, y: -360, delay: 1.45 },
];

export const RecoilPattern: React.FC = () => {
  const [shots, setShots] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isPressing, setIsPressing] = useState(false);

  const currentIdxRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const flashX = useMotionValue(0);
  const flashY = useMotionValue(0);

  const fireShot = useCallback(() => {
    const idx = currentIdxRef.current;
    const offset = AK47_RECOIL_PATTERN[idx % AK47_RECOIL_PATTERN.length];

    const newShot = {
      id: Date.now() + Math.random(),
      x: mousePosRef.current.x + offset.x,
      y: mousePosRef.current.y + offset.y,
    };

    setShots((prev) => [...prev.slice(-30), newShot]);
    currentIdxRef.current += 1;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      flashX.set(e.clientX);
      flashY.set(e.clientY);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      flashX.set(e.clientX);
      flashY.set(e.clientY);
      setIsPressing(true);
      fireShot();
      intervalRef.current = setInterval(fireShot, 100);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;
      setIsPressing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      currentIdxRef.current = 0;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fireShot, flashX, flashY]);

  return (
    <div className="fixed inset-0 z-100 pointer-events-none">
      <AnimatePresence>
        {shots.map((shot) => (
          <motion.div
            key={shot.id}
            initial={{ opacity: 1, scale: 1.2 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute w-[3px] h-[3px] bg-orange-400 rounded-full shadow-[0_0_12px_#fbbf24]"
            style={{
              left: shot.x,
              top: shot.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>

      {isPressing && (
        <motion.div
          animate={{ opacity: [0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="fixed pointer-events-none w-20 h-20 z-999 bg-orange-500/10 rounded-full blur-3xl"
          style={{
            x: flashX,
            y: flashY,
            translateX: "-50%",
            translateY: "-50%",
          }}
        />
      )}
    </div>
  );
};
