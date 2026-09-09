"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface SessionUser {
  id: number;
  steamId: string;
  nickname: string;
  avatar: string | null;
  isAdmin: boolean;
}

const BUTTON_CLASS =
  "relative overflow-hidden px-6 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white border border-zinc-800 hover:border-white transition-colors group/btn";

export function AuthChip() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // До ответа ничего не показываем, чтобы навбар не «прыгал».
  if (!loaded) return null;

  if (!user) {
    return (
      <a href="/api/auth/steam" className={BUTTON_CLASS}>
        <span className="relative z-10 group-hover/btn:text-black transition-colors">
          Steam_Вход
        </span>
        <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
      </a>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.avatar && (
        <Image
          src={user.avatar}
          alt=""
          width={24}
          height={24}
          className="border border-zinc-800"
        />
      )}
      <span className="hidden md:block font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-500">
        {user.nickname}
      </span>
      {user.isAdmin && (
        <a href="/admin" className={BUTTON_CLASS}>
          <span className="relative z-10 group-hover/btn:text-black transition-colors">
            Админка
          </span>
          <div className="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
        </a>
      )}
    </div>
  );
}
