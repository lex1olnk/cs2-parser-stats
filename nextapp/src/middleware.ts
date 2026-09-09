// Гейт на админку. Работает в Edge-рантайме, поэтому проверяет только подпись
// сессионной cookie и claim admin — без обращения к БД (Prisma в Edge нет).
//
// Это защита страниц и удобство редиректа, а НЕ граница безопасности:
// каждый мутирующий API-роут дополнительно вызывает requireAdmin(), который
// перечитывает актуальный is_admin из базы.

import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const session = await verifySession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (!session.admin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "forbidden");

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
