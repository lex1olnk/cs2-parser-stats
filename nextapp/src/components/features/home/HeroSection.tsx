"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const TOURNAMENTS = [
  { id: "pgl_2024", name: "PGL_Major" },
  { id: "iem_katowice", name: "IEM_Katowice" },
  { id: "blast_final", name: "Blast_Premier" },
];

export const HeroSection = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentId = searchParams.get("tournament") || TOURNAMENTS[0].id;

  const handleSelect = (id: string) => {
    // Обновляем URL: ?tournament=pgl_2024
    router.push(`?tournament=${id}`, { scroll: false });
  };

  return (
    <section className="h-full w-full flex flex-col justify-center px-12">
      <div className="space-y-4">
        <span className="text-zinc-600 font-mono text-[10px] tracking-[0.5em]">
          SELECT_ACTIVE_DATABASE_NODE
        </span>
        <div className="flex flex-wrap gap-4">
          {TOURNAMENTS.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className={`px-6 py-3 border transition-all duration-300 uppercase font-black italic tracking-tighter text-2xl ${
                currentId === t.id
                  ? "bg-white text-black border-white"
                  : "border-zinc-900 text-zinc-700 hover:border-zinc-500"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Большой фоновый текст, меняющийся от выбора */}
      <motion.div
        key={currentId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute bottom-10 right-10 text-[15vw] font-black text-white/5 pointer-events-none uppercase italic leading-none"
      >
        {TOURNAMENTS.find((t) => t.id === currentId)?.name.split("_")[0]}
      </motion.div>
    </section>
  );
};
