// components/ui/Flashlight.tsx
"use client";
import { useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const Flashlight = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Настройки плавности для каждого канала (разная инерция создает разрыв)
  const springR = { damping: 20, stiffness: 100 };
  const springG = { damping: 25, stiffness: 120 };
  const springB = { damping: 30, stiffness: 140 };

  const xR = useSpring(mouseX, springR);
  const yR = useSpring(mouseY, springR);

  const xG = useSpring(mouseX, springG);
  const yG = useSpring(mouseY, springG);

  const xB = useSpring(mouseX, springB);
  const yB = useSpring(mouseY, springB);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* КРАСНЫЙ КАНАЛ */}
      <motion.div
        className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#ff0000] mix-blend-screen blur-3xl opacity-50"
        style={{ x: xR, y: yR, translateX: "-50%", translateY: "-50%" }}
      />

      {/* ЗЕЛЕНЫЙ КАНАЛ */}
      <motion.div
        className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#00ff00] mix-blend-screen blur-3xl opacity-50"
        style={{ x: xG, y: yG, translateX: "-50%", translateY: "-50%" }}
      />

      {/* СИНИЙ КАНАЛ */}
      <motion.div
        className="absolute top-0 left-0 w-80 h-80 rounded-full bg-[#0000ff] mix-blend-screen blur-3xl opacity-50"
        style={{ x: xB, y: yB, translateX: "-50%", translateY: "-50%" }}
      />

      {/* ФИНАЛЬНОЕ ПЯТНО ИНВЕРСИИ (чтобы текст читался) */}
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-difference blur-2xl"
        style={{ x: xG, y: yG, translateX: "-50%", translateY: "-50%" }}
      />
    </div>
  );
};
