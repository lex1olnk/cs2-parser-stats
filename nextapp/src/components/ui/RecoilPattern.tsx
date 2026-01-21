// components/ui/RecoilPattern.tsx
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Паттерн разброса АК-47 в CS:GO (относительные координаты от центра)
// Эти значения можно подкорректировать, чтобы добиться нужного визуального эффекта
const AK47_RECOIL_PATTERN = [
  { x: 0, y: 0, delay: 0 }, // 1st shot - accurate
  { x: 0, y: -20, delay: 0.05 }, // 2nd shot - slightly up
  { x: 0, y: -40, delay: 0.1 }, // 3rd shot - up
  { x: 5, y: -65, delay: 0.15 }, // 4th shot - up-right
  { x: -5, y: -90, delay: 0.2 }, // 5th shot - up-left
  { x: 10, y: -110, delay: 0.25 }, // 6th shot - up-right again
  { x: -10, y: -130, delay: 0.3 }, // 7th shot - up-left
  { x: 20, y: -140, delay: 0.35 }, // 8th shot - right
  { x: -20, y: -150, delay: 0.4 }, // 9th shot - left
  { x: 15, y: -160, delay: 0.45 }, // 10th shot - right-up
  { x: -25, y: -170, delay: 0.5 }, // 11th shot - left-up
  { x: 10, y: -180, delay: 0.55 }, // 12th shot - spread out
  { x: -30, y: -190, delay: 0.6 }, // 13th shot
  { x: 0, y: -200, delay: 0.65 }, // 14th shot
  { x: 25, y: -210, delay: 0.7 }, // 15th shot
  { x: -15, y: -220, delay: 0.75 }, // 16th shot
  { x: 30, y: -230, delay: 0.8 }, // 17th shot
  { x: -10, y: -240, delay: 0.85 }, // 18th shot
  { x: 20, y: -250, delay: 0.9 }, // 19th shot
  { x: -5, y: -260, delay: 0.95 }, // 20th shot
  { x: 10, y: -270, delay: 1.0 }, // 21st shot - last few
  { x: -20, y: -280, delay: 1.05 }, // 22nd shot
  { x: 0, y: -290, delay: 1.1 }, // 23rd shot
  { x: 15, y: -300, delay: 1.15 }, // 24th shot
  { x: -25, y: -310, delay: 1.2 }, // 25th shot
  { x: 5, y: -320, delay: 1.25 }, // 26th shot
  { x: -10, y: -330, delay: 1.3 }, // 27th shot
  { x: 20, y: -340, delay: 1.35 }, // 28th shot
  { x: -15, y: -350, delay: 1.4 }, // 29th shot
  { x: 0, y: -360, delay: 1.45 }, // 30th shot
];

interface Shot {
  id: number;
  x: number;
  y: number;
  delay: number;
}

export const RecoilPattern: React.FC = () => {
  const [shots, setShots] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );
  const [isPressing, setIsPressing] = useState(false);

  // Используем Ref, чтобы значения были доступны внутри интервала без лишних перерисовок
  const currentIdxRef = useRef(0);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fireShot = useCallback(() => {
    const idx = currentIdxRef.current;
    const offset = AK47_RECOIL_PATTERN[idx % AK47_RECOIL_PATTERN.length];

    const newShot = {
      id: Date.now() + Math.random(), // Уникальный ID
      x: mousePosRef.current.x + offset.x,
      y: mousePosRef.current.y + offset.y,
    };

    setShots((prev) => [...prev.slice(-30), newShot]);
    currentIdxRef.current += 1;
  }, []);

  const startShooting = (e: React.MouseEvent) => {
    console.log("shooting");
    setIsPressing(true);
    mousePosRef.current = { x: e.clientX, y: e.clientY };

    // Сразу первый выстрел
    fireShot();

    // Запускаем цикл стрельбы (у АК темп стрельбы ~600 выстрелов в минуту = 100мс)
    intervalRef.current = setInterval(fireShot, 100);
  };

  const stopShooting = () => {
    setIsPressing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    currentIdxRef.current = 0; // Сброс паттерна при отпускании (как в игре)
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-100 cursor-crosshair"
      onMouseDown={startShooting}
      onMouseUp={stopShooting}
      onMouseLeave={stopShooting} // Чтобы стрельба не "залипла" при уводе мыши
    >
      <AnimatePresence>
        {shots.map((shot) => (
          <motion.div
            key={shot.id}
            initial={{ opacity: 1, scale: 1.2 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }} // Время жизни дырки
            className="absolute w-[3px] h-[3px] bg-orange-400 rounded-full shadow-[0_0_12px_#fbbf24]"
            style={{
              left: shot.x,
              top: shot.y,
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </AnimatePresence>

      {/* Эффект дульной вспышки (необязательно) */}
      {isPressing && (
        <motion.div
          animate={{ opacity: [0.8, 0.2] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="fixed pointer-events-none w-20 h-20 z-999 bg-orange-500/10 rounded-full blur-3xl"
          style={{
            left: mousePosRef.current.x,
            top: mousePosRef.current.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
    </div>
  );
};
