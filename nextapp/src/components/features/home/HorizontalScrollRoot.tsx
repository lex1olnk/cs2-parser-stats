"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";

export default function HorizontalScrollRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  const targetRef = useRef<HTMLDivElement>(null);

  // Отслеживаем прогресс скролла по вертикали (0 до 1)
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Трансформируем вертикальный скролл в горизонтальное смещение (от 0% до -100%)
  // -66% если у тебя 3 секции, -75% если 4 и так далее.
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    // Высота этого контейнера определяет, как долго будет длиться скролл (300vh = 3 экрана)
    <div ref={targetRef} className="relative h-[300vh] bg-[#0a0a0a]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
