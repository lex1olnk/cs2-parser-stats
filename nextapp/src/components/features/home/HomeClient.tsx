// components/home/HomeClient.tsx
"use client";

import { RecoilPattern } from "@/components/ui/RecoilPattern";
import { HybridScroll } from "@/components/features/home/HybridScroll";

interface HomeClientProps {
  children: React.ReactNode;
}

export const HomeClient = ({ children }: HomeClientProps) => {
  return (
    <main className="relative min-h-screen bg-black selection:bg-orange-500 selection:text-white">
      {/* 1. Клиентский эффект стрельбы */}
      <RecoilPattern />

      {/* 2. Фоновая сетка */}
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* 3. Контент со скроллом */}
      <div className="relative z-10">
        <HybridScroll>{children}</HybridScroll>
      </div>
    </main>
  );
};
