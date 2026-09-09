// Гарды для route handlers (Node-рантайм, читают БД).
//
// middleware.ts проверяет только подпись cookie и claim admin — этого хватает,
// чтобы не пускать посторонних на страницы, но claim мог устареть (права
// отозвали, а токен ещё живой). Настоящая граница безопасности — здесь:
// каждый мутирующий роут перечитывает актуальный is_admin из БД.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "./session";

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const store = await cookies();

  return verifySession(store.get(SESSION_COOKIE)?.value);
}

export interface SessionUser {
  id: number;
  steamId: string;
  nickname: string;
  avatar: string | null;
  isAdmin: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    select: {
      id: true,
      steamId: true,
      nickname: true,
      avatar: true,
      isAdmin: true,
    },
  });

  // Токен подписан нами, но пользователя могли удалить — и steamId в токене
  // должен совпадать с тем, что сейчас в БД под этим id.
  if (!user || user.steamId !== payload.sid) return null;

  return user;
}

type Guard =
  | { ok: true; user: SessionUser }
  | { ok: false; response: NextResponse };

/**
 * Использование в роуте:
 *   const guard = await requireAdmin();
 *   if (!guard.ok) return guard.response;
 */
export async function requireAdmin(): Promise<Guard> {
  const user = await getSessionUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  if (!user.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, user };
}
