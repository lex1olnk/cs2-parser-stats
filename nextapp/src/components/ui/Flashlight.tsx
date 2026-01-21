// components/ui/RecoilPattern.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
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

interface RecoilPatternProps {
  isActive: boolean; // Включает/выключает паттерн
  position: { x: number; y: number }; // Центр, откуда летят пули
  onAnimationComplete: () => void; // Колбэк после завершения анимации
}

export const RecoilPattern: React.FC<RecoilPatternProps> = ({
  isActive,
  position,
  onAnimationComplete,
}) => {
  const [shots, setShots] = useState<Shot[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isActive) {
      // Очищаем предыдущие таймауты
      timeoutRef.current.forEach(clearTimeout);
      timeoutRef.current = [];
      setShots([]); // Очищаем предыдущие пули

      AK47_RECOIL_PATTERN.forEach((pattern, index) => {
        const timeout = setTimeout(() => {
          setShots((prev) => [...prev, { id: index, ...pattern }]);
          if (index === AK47_RECOIL_PATTERN.length - 1) {
            // Запускаем колбэк после последнего выстрела
            setTimeout(onAnimationComplete, 500); // Небольшая задержка, чтобы точки исчезли
          }
        }, pattern.delay * 1000); // Переводим задержку в миллисекунды
        timeoutRef.current.push(timeout);
      });
    } else {
      // Если isActive false, очищаем все выстрелы
      timeoutRef.current.forEach(clearTimeout);
      timeoutRef.current = [];
      setShots([]);
    }

    return () => {
      timeoutRef.current.forEach(clearTimeout);
    };
  }, [isActive, onAnimationComplete]);

  if (!isActive) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]" // Высокий z-index, чтобы быть поверх всего
    >
      {shots.map((shot) => (
        <motion.div
          key={shot.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          className="absolute w-1 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)]"
          style={{
            left: position.x + shot.x,
            top: position.y + shot.y,
            transform: "translate(-50%, -50%)", // Центрируем точку
          }}
        />
      ))}
    </div>
  );
};
