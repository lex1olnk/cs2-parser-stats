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
] as const;

export interface RefreshResult {
  refreshed: string[];
  failed: Array<{ view: string; error: string }>;
  durationMs: number;
}

export async function refreshStatsViews(): Promise<RefreshResult> {
  const startedAt = Date.now();
  const refreshed: string[] = [];
  const failed: RefreshResult["failed"] = [];

  for (const view of STATS_VIEWS) {
    try {
      // Имя вьюшки берётся из константы выше, а не из запроса пользователя,
      // поэтому подстановка в SQL безопасна.
      await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW "${view}"`);
      refreshed.push(view);
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
    `Статистика пересчитана: ${refreshed.length}/${STATS_VIEWS.length} вьюшек за ${durationMs} мс`,
  );

  return { refreshed, failed, durationMs };
}
