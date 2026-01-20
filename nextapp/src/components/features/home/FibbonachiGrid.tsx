"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export const FibonacciGrid = () => {
  const { scrollYProgress } = useScroll();
  // Сетка будет немного смещаться, создавая эффект глубины
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <motion.div
      style={{ y }}
      className="absolute inset-0 z-[-1] pointer-events-none opacity-20"
    >
      {/* Вертикальные линии по Фибоначчи (относительные % ширины) */}
      <div className="absolute inset-0 flex items-stretch">
        <div className="w-[1%] border-r border-zinc-700" />
        <div className="w-[1%] border-r border-zinc-700" />
        <div className="w-[2%] border-r border-zinc-700" />
        <div className="w-[3%] border-r border-zinc-800" />
        <div className="w-[5%] border-r border-zinc-800" />
        <div className="w-[8%] border-r border-zinc-800" />
        <div className="w-[13%] border-r border-white/10" />
        <div className="w-[21%] border-r border-zinc-800" />
        <div className="flex-1 border-r border-zinc-800" />
      </div>

      {/* Горизонтальные линии */}
      <div className="absolute inset-0 flex flex-col items-stretch">
        <div className="h-[5%] border-b border-zinc-800" />
        <div className="h-[8%] border-b border-white/5" />
        <div className="h-[13%] border-b border-zinc-800" />
        <div className="h-[21%] border-b border-zinc-800" />
        <div className="flex-1" />
      </div>

      {/* Золотая спираль (SVG фрагмент для декора) */}
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-10"
        viewBox="0 0 1000 1000"
      >
        <path
          d="M 618,382 A 236,236 0 0 1 382,618 A 382,382 0 0 1 0,236"
          stroke="white"
          fill="none"
          strokeWidth="0.5"
        />
      </svg>
    </motion.div>
  );
};
