// Ручной пересчёт материализованных вьюшек со статистикой.
//
// Пайплайн загрузки матчей делает это сам, но если данные попали в базу мимо
// него (импорт, правка руками), лидерборды останутся со старыми числами,
// пока не дёрнуть этот роут.

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/rate-limit";
import { refreshStatsViews } from "@/services/server/server-parse-services/stats-refresh-service";

export const dynamic = "force-dynamic";

export async function POST() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  // Полный REFRESH — тяжёлая операция, дёргать её пачкой незачем.
  const limit = checkRateLimit(`stats-refresh:${guard.user.id}`, 3, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many refresh requests", retryAfter: limit.retryAfter },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const result = await refreshStatsViews();

  return NextResponse.json(result, {
    status: result.failed.length > 0 ? 207 : 200,
  });
}
