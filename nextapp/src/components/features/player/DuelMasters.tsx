"use client";
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

export function DuelMasters() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 }); // Анимировать один раз, когда 50% элемента видно

  const masters = [
    { label: "CAP", value: "54.2%", color: "text-red-500" },
    { label: "01", value: "54.2%", color: "text-yellow-400" },
    { label: "02", value: "54.2%", color: "text-green-400" },
    { label: "03", value: "54.2%", color: "text-cyan-400" },
    { label: "04", value: "54.2%", color: "text-blue-500" },
  ];

  return (
    <section ref={ref} className="pt-20 border-t border-zinc-900">
      <div className="flex justify-center gap-16">
        {masters.map((m, i) => (
          <motion.div
            key={m.label}
            className="text-center group"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <p
              className={`text-xl font-black italic mb-2 tracking-tighter ${m.color} transition-transform group-hover:-translate-y-1`}
            >
              {m.label}
            </p>
            <p className="text-3xl font-black italic tracking-tighter text-white">
              {m.value}
            </p>
            <p className="text-[10px] text-zinc-700 italic font-bold mt-1">
              142 | 108
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
