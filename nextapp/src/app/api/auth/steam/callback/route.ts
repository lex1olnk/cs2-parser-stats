// Возврат из Steam: проверяем утверждение, заводим/обновляем User, выдаём сессию.

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  sessionCookieOptions,
  signSession,
  SESSION_COOKIE,
} from "@/lib/auth/session";
import {
  buildReturnToUrl,
  fetchSteamProfile,
  getAppUrl,
  isBootstrapAdmin,
  NEXT_COOKIE,
  safeNextPath,
  STATE_COOKIE,
  verifySteamAssertion,
} from "@/lib/auth/steam";

export const dynamic = "force-dynamic";

function loginFailed(reason: string) {
  console.warn(`Steam login rejected: ${reason}`);

  return NextResponse.redirect(`${getAppUrl()}/login?error=${reason}`);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  // 1. state из cookie должен совпасть со state в return_to — иначе это
  //    не наш начатый логин (навязанная сессия / переигранный редирект).
  const state = params.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!state || !expectedState || state !== expectedState) {
    return loginFailed("invalid_state");
  }

  // 2. Единственный источник истины о том, кто это — ответ Steam.
  const steamId = await verifySteamAssertion(params, buildReturnToUrl(state));
  if (!steamId) return loginFailed("invalid_assertion");

  // 3. Ник и аватар — из Steam Web API, если ключ настроен.
  const profile = await fetchSteamProfile(steamId);
  const grantAdmin = isBootstrapAdmin(steamId);

  const user = await prisma.user.upsert({
    where: { steamId },
    create: {
      steamId,
      nickname: profile?.nickname ?? steamId,
      avatar: profile?.avatar ?? null,
      isAdmin: grantAdmin,
      lastLoginAt: new Date(),
    },
    update: {
      nickname: profile?.nickname ?? undefined,
      avatar: profile?.avatar ?? undefined,
      // ADMIN_STEAM_IDS только повышает права. Забрать их можно, сняв
      // is_admin в БД: окружение — это бутстрап, а не источник истины.
      isAdmin: grantAdmin ? true : undefined,
      lastLoginAt: new Date(),
    },
    select: {
      id: true,
      steamId: true,
      nickname: true,
      avatar: true,
      isAdmin: true,
    },
  });

  const token = await signSession({
    uid: user.id,
    sid: user.steamId,
    name: user.nickname,
    avatar: user.avatar,
    admin: user.isAdmin,
  });

  // Cookie не подписана, поэтому путь проверяется ещё раз при чтении.
  const nextPath =
    safeNextPath(request.cookies.get(NEXT_COOKIE)?.value) ??
    (user.isAdmin ? "/admin" : "/");

  const response = NextResponse.redirect(`${getAppUrl()}${nextPath}`);
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  response.cookies.delete(STATE_COOKIE);
  response.cookies.delete(NEXT_COOKIE);

  return response;
}
