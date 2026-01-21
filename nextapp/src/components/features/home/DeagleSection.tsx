"use client";
import React, { useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, useSpring, useTransform } from "framer-motion";
import { DeagleRotation } from "./DeagleRotation";
import { useStore } from "@/store";

export const DeagleSection = React.memo(() => {
  const scrollYProgress = useStore((state) => state.scrollYProgress);

  // Создаем ОДНО плавное значение для всех анимаций в этой секции
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Оптимизируем прозрачность текста: он появляется в начале и исчезает в конце секции
  const textOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0],
  );

  return (
    <section className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Фоновый текст */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.h2
            style={{ opacity: textOpacity }}
            className="text-[20vw] font-black italic text-zinc-900/50 select-none uppercase tracking-tighter"
          >
            Deagle
          </motion.h2>
        </div>

        {/* 3D Canvas - Оптимизированный dpr */}
        <div className="absolute inset-0 z-10">
          <Canvas
            flat // Отключает лишние расчеты освещения (ACESFilmic) если не нужно
            dpr={[1, 1.5]} // Ограничиваем dpr для производительности на 4k
            gl={{ antialias: true, powerPreference: "high-performance" }}
            camera={{ position: [0, 0, 4], fov: 40 }}
          >
            <DeagleRotation />
          </Canvas>
        </div>

        {/* Декоративный UI */}
        <div className="absolute bottom-10 left-10 z-20 font-mono text-white/30 text-[10px] tracking-[0.2em] uppercase">
          <p className="mb-1">Model: Desert_Eagle // .50 AE</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p>System: Active_Rotation</p>
          </div>
        </div>
      </div>
    </section>
  );
});

DeagleSection.displayName = "DeagleSection";
