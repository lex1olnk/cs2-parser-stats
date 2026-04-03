// components/home/HomeClient.tsx
"use client";

import { useEffect } from "react";
import { RecoilPattern } from "@/components/ui/RecoilPattern";
import { HybridScroll } from "@/components/features/home/HybridScroll";
import { useStore } from "@/store";
import type { Tournament } from "@/types";

interface HomeClientProps {
  children: React.ReactNode;
  tournaments: Tournament[];
}

export const HomeClient = ({ children, tournaments }: HomeClientProps) => {
  const setTournaments = useStore((state) => state.setTournaments);

  useEffect(() => {
    setTournaments(tournaments);
  }, [tournaments, setTournaments]);

  return (
    <main className="relative min-h-screen bg-black selection:bg-orange-500 selection:text-white">
      <RecoilPattern />

      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10">
        <HybridScroll>{children}</HybridScroll>
      </div>
    </main>
  );
};
