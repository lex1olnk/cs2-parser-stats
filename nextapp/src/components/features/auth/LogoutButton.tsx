"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      router.push("/");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={pending}
      className={
        className ??
        "relative overflow-hidden px-6 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white border border-zinc-800 hover:border-white transition-colors group/btn disabled:opacity-40"
      }
    >
      <span className="relative z-10 group-hover/btn:text-black transition-colors">
        {pending ? "Выход..." : "Выйти"}
      </span>
      <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
    </button>
  );
}
