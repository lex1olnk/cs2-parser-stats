import { prisma } from "@/lib/prisma";

/**
 * Материализованные вьюшки со статистикой не обновляются сами: пока не сделан
 * REFRESH, свежезагруженные матчи не видны ни в одном лидерборде.
 *
 * Обновляем всю пачку разом после загрузки, а не после каждого матча —
 * при заливке 20 матчей это разница между 7 и 140 пересчётами.
 */
const STATS_VIEWS = [
  "kill_stats_per_match",
  "death_stats_per_match",
  "assist_stats_per_match",
  "damage_stats_per_match",
  "rounds_played_per_match",
  "kast_per_match",
  "player_rating_components_per_match",
  "match_kill_with_trade",
  "flash_assist_stats_per_match",
  "player_swing_per_match",
  // Зависит от пяти вьюшек выше, поэтому идёт последней: порядок в списке —
  // это порядок пересчёта.
  "player_rating2_components_per_match",
] as const;

export interface RefreshResult {
  refreshed: string[];
  failed: Array<{ view: string; error: string }>;
  /** Вьюшки, которые пришлось пересчитать с блокировкой читателей. */
  blocking: string[];
  durationMs: number;
}

/**
 * Пересчёт идёт CONCURRENTLY: обычный REFRESH берёт ACCESS EXCLUSIVE, и пока
 * он работает, вьюшка недоступна на чтение — страницы игроков и лидерборды
 * в этот момент ждут. CONCURRENTLY сам по себе медленнее, но читателей
 * не трогает, а пересчёт вызывается после каждой заливки и после удаления
 * матча, то есть ровно тогда, когда сайтом пользуются.
 *
 * Условий у него два, и оба могут не выполняться на чужой базе: нужен
 * уникальный индекс (миграция 20260910080000) и вьюшка должна быть уже
 * хоть раз наполнена — свежесозданную CONCURRENTLY обновить нельзя.
 * Поэтому при отказе повторяем обычным способом, а не считаем это ошибкой.
 */
export async function refreshStatsViews(): Promise<RefreshResult> {
  const startedAt = Date.now();
  const refreshed: string[] = [];
  const blocking: string[] = [];
  const failed: RefreshResult["failed"] = [];

  for (const view of STATS_VIEWS) {
    // Имя вьюшки берётся из константы выше, а не из запроса пользователя,
    // поэтому подстановка в SQL безопасна.
    try {
      await prisma.$executeRawUnsafe(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY "${view}"`,
      );
      refreshed.push(view);
      continue;
    } catch {
      // Разбираться, почему именно не вышло, смысла нет: и отсутствие
      // индекса, и ненаполненная вьюшка лечатся одним и тем же откатом.
    }

    try {
      await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW "${view}"`);
      refreshed.push(view);
      blocking.push(view);
    } catch (error) {
      // Одна упавшая вьюшка не должна мешать пересчитать остальные:
      // на старой базе какой-то из них может просто не быть.
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Не удалось обновить ${view}: ${message}`);
      failed.push({ view, error: message });
    }
  }

  const durationMs = Date.now() - startedAt;
  console.log(
    `Статистика пересчитана: ${refreshed.length}/${STATS_VIEWS.length} вьюшек за ${durationMs} мс` +
      (blocking.length
        ? `; с блокировкой читателей: ${blocking.join(", ")}`
        : ""),
  );

  return { refreshed, failed, blocking, durationMs };
}
