// Старт логина: редирект на Steam OpenID.

import { NextRequest, NextResponse } from "next/server";

import {
  buildSteamLoginUrl,
  LOGIN_FLOW_MAX_AGE,
  NEXT_COOKIE,
  safeNextPath,
  STATE_COOKIE,
} from "@/lib/auth/steam";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const state = crypto.randomUUID();
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  const response = NextResponse.redirect(buildSteamLoginUrl(state));
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: LOGIN_FLOW_MAX_AGE,
  };

  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  if (next) response.cookies.set(NEXT_COOKIE, next, cookieOptions);

  return response;
}
