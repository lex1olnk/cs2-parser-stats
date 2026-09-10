-- Уникальные индексы на материализованных вьюшках.
--
-- Нужны ради REFRESH MATERIALIZED VIEW CONCURRENTLY: без уникального
-- индекса Postgres его просто не разрешает. Обычный REFRESH берёт
-- ACCESS EXCLUSIVE и на время пересчёта вьюшка недоступна на чтение —
-- то есть страницы игроков и лидерборды в этот момент ждут. Сейчас это
-- 180 мс на всё, но пересчёт вызывается после каждой заливки и после
-- удаления матча, и растёт вместе с базой.
--
-- Ключ у всех этих вьюшек один и тот же — игрок и матч. Проверено, что
-- дубликатов по нему нет ни в одной.
--
-- Трём вьюшкам индекс уже добавляли раньше: match_kill_with_trade,
-- player_swing_per_match и player_rating2_components_per_match.

CREATE UNIQUE INDEX IF NOT EXISTS kill_stats_per_match_pk_idx
  ON kill_stats_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS death_stats_per_match_pk_idx
  ON death_stats_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS assist_stats_per_match_pk_idx
  ON assist_stats_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS damage_stats_per_match_pk_idx
  ON damage_stats_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS rounds_played_per_match_pk_idx
  ON rounds_played_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS kast_per_match_pk_idx
  ON kast_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS prc_per_match_pk_idx
  ON player_rating_components_per_match (player_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS flash_assist_stats_pk_idx
  ON flash_assist_stats_per_match (player_id, match_id);
