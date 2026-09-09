-- Недостающие материализованные вьюшки со статистикой.
--
-- Эти вьюшки уже используются кодом:
--   kill_stats_per_match, damage_stats_per_match — /tournament/players
--   + rounds_played_per_match, death_stats_per_match, assist_stats_per_match,
--     kast_per_match                             — /api/stats/stats
-- но ни одна миграция их не создавала: они заводились вручную прямо в БД.
-- Из-за этого на свежей базе обе страницы падали с "relation does not exist".
--
-- Все вьюшки создаются через IF NOT EXISTS: на базе, где они уже заведены
-- руками, миграция ничего не меняет и не перезаписывает существующие определения.
--
-- Соглашения совпадают с player_rating_components_per_match:
--   гранулярность — (player_id, match_id), tournament_id продублирован
--   для фильтрации, тимкиллы и урон по своим исключены.

-- ---------------------------------------------------------------------------
-- Убийства и хедшоты
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS kill_stats_per_match AS
SELECT
  mk.killer_id::int                                     AS player_id,
  mk.match_id,
  m.tournament_id,
  COUNT(*)::int                                         AS kills,
  SUM(CASE WHEN mk.is_headshot THEN 1 ELSE 0 END)::int  AS hs_kills
FROM match_kill mk
JOIN match m ON m.id = mk.match_id
WHERE mk.killer_id IS NOT NULL
  AND mk.is_teamkill = false
GROUP BY mk.killer_id, mk.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS kill_stats_per_match_player_idx
  ON kill_stats_per_match (player_id);
CREATE INDEX IF NOT EXISTS kill_stats_per_match_tournament_idx
  ON kill_stats_per_match (tournament_id);

-- ---------------------------------------------------------------------------
-- Смерти
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS death_stats_per_match AS
SELECT
  mk.victim_id::int AS player_id,
  mk.match_id,
  m.tournament_id,
  COUNT(*)::int     AS deaths
FROM match_kill mk
JOIN match m ON m.id = mk.match_id
GROUP BY mk.victim_id, mk.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS death_stats_per_match_player_idx
  ON death_stats_per_match (player_id);
CREATE INDEX IF NOT EXISTS death_stats_per_match_tournament_idx
  ON death_stats_per_match (tournament_id);

-- ---------------------------------------------------------------------------
-- Ассисты
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS assist_stats_per_match AS
SELECT
  mk.assistant_id::int AS player_id,
  mk.match_id,
  m.tournament_id,
  COUNT(*)::int        AS assists
FROM match_kill mk
JOIN match m ON m.id = mk.match_id
WHERE mk.assistant_id IS NOT NULL
  AND mk.is_teamkill = false
GROUP BY mk.assistant_id, mk.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS assist_stats_per_match_player_idx
  ON assist_stats_per_match (player_id);
CREATE INDEX IF NOT EXISTS assist_stats_per_match_tournament_idx
  ON assist_stats_per_match (tournament_id);

-- ---------------------------------------------------------------------------
-- Сыгранные раунды: все раунды матчей, в которых игрок был в составе
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS rounds_played_per_match AS
WITH player_team AS (
  SELECT DISTINCT
    mm.user_id::int  AS player_id,
    mm.match_id      AS match_id,
    mm.match_team_id AS team_id
  FROM match_member mm
  WHERE mm.user_id IS NOT NULL
    AND mm.match_id IS NOT NULL
    AND mm.match_team_id IS NOT NULL
)
SELECT
  pt.player_id,
  pt.match_id,
  m.tournament_id,
  COUNT(r.id)::int AS rounds
FROM player_team pt
JOIN round r ON r.match_id = pt.match_id
JOIN match m ON m.id = pt.match_id
GROUP BY pt.player_id, pt.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS rounds_played_per_match_player_idx
  ON rounds_played_per_match (player_id);
CREATE INDEX IF NOT EXISTS rounds_played_per_match_tournament_idx
  ON rounds_played_per_match (tournament_id);

-- ---------------------------------------------------------------------------
-- Урон. damage_normalized обрезан оставшимся HP жертвы — именно он нужен
-- для ADR; damage_real оставлен рядом для «сырых» подсчётов.
-- Урон по своим и по себе исключён.
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS damage_stats_per_match AS
WITH player_team AS (
  SELECT DISTINCT
    mm.user_id::int  AS player_id,
    mm.match_id      AS match_id,
    mm.match_team_id AS team_id
  FROM match_member mm
  WHERE mm.user_id IS NOT NULL
    AND mm.match_id IS NOT NULL
    AND mm.match_team_id IS NOT NULL
)
SELECT
  md.inflictor_id::int          AS player_id,
  md.match_id,
  m.tournament_id,
  SUM(md.damage_normalized)::int AS damage,
  SUM(md.damage_real)::int       AS damage_real,
  SUM(md.hits)::int              AS hits
FROM match_damage md
JOIN match m ON m.id = md.match_id
JOIN player_team pti
  ON pti.player_id = md.inflictor_id::int
 AND pti.match_id  = md.match_id
JOIN player_team ptv
  ON ptv.player_id = md.victim_id::int
 AND ptv.match_id  = md.match_id
WHERE md.inflictor_id <> md.victim_id
  AND pti.team_id <> ptv.team_id
GROUP BY md.inflictor_id, md.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS damage_stats_per_match_player_idx
  ON damage_stats_per_match (player_id);
CREATE INDEX IF NOT EXISTS damage_stats_per_match_tournament_idx
  ON damage_stats_per_match (tournament_id);

-- ---------------------------------------------------------------------------
-- KAST: доля раундов, в которых игрок сделал убийство, ассист, выжил
-- или был отомщён (traded). Окно трейда — 320 тиков (~5 сек при 64 tick),
-- как в player_rating_components_per_match.
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS kast_per_match AS
WITH
  player_team AS (
    SELECT DISTINCT
      mm.user_id::int  AS player_id,
      mm.match_id      AS match_id,
      mm.match_team_id AS team_id
    FROM match_member mm
    WHERE mm.user_id IS NOT NULL
      AND mm.match_id IS NOT NULL
      AND mm.match_team_id IS NOT NULL
  ),
  player_rounds AS (
    SELECT
      pt.player_id,
      pt.match_id,
      r.id AS round_id
    FROM player_team pt
    JOIN round r ON r.match_id = pt.match_id
  ),
  kills_by_round AS (
    SELECT
      mk.killer_id::int AS player_id,
      mk.round_id,
      COUNT(*)::int     AS kills
    FROM match_kill mk
    WHERE mk.killer_id IS NOT NULL
      AND mk.is_teamkill = false
    GROUP BY mk.killer_id, mk.round_id
  ),
  assists_by_round AS (
    SELECT DISTINCT
      mk.assistant_id::int AS player_id,
      mk.round_id
    FROM match_kill mk
    WHERE mk.assistant_id IS NOT NULL
      AND mk.is_teamkill = false
  ),
  death_by_round AS (
    SELECT DISTINCT ON (mk.victim_id, mk.round_id)
      mk.victim_id::int AS player_id,
      mk.match_id,
      mk.round_id,
      mk.killer_id::int AS killer_id,
      mk.tick           AS death_tick
    FROM match_kill mk
    ORDER BY mk.victim_id, mk.round_id, mk.tick ASC
  ),
  traded_flag AS (
    SELECT
      d.player_id,
      d.round_id,
      EXISTS (
        SELECT 1
        FROM match_kill mk2
        JOIN player_team pt_avenger
          ON pt_avenger.player_id = mk2.killer_id::int
         AND pt_avenger.match_id  = mk2.match_id
        JOIN player_team pt_victim
          ON pt_victim.player_id = d.player_id
         AND pt_victim.match_id  = d.match_id
        WHERE mk2.round_id = d.round_id
          AND mk2.victim_id::int = d.killer_id
          AND mk2.killer_id IS NOT NULL
          AND mk2.killer_id::int <> d.player_id
          AND pt_avenger.team_id = pt_victim.team_id
          AND mk2.tick >= d.death_tick
          AND mk2.tick - d.death_tick <= 320
      ) AS is_traded
    FROM death_by_round d
    WHERE d.killer_id IS NOT NULL
  )
SELECT
  pr.player_id,
  pr.match_id,
  m.tournament_id,
  COUNT(*)::int AS total_rounds,
  SUM(
    CASE
      WHEN COALESCE(k.kills, 0) > 0     THEN 1  -- Kill
      WHEN a.player_id IS NOT NULL      THEN 1  -- Assist
      WHEN d.player_id IS NULL          THEN 1  -- Survived
      WHEN COALESCE(tf.is_traded, false) THEN 1 -- Traded
      ELSE 0
    END
  )::int AS kast_rounds
FROM player_rounds pr
JOIN match m ON m.id = pr.match_id
LEFT JOIN kills_by_round k
  ON k.player_id = pr.player_id AND k.round_id = pr.round_id
LEFT JOIN assists_by_round a
  ON a.player_id = pr.player_id AND a.round_id = pr.round_id
LEFT JOIN death_by_round d
  ON d.player_id = pr.player_id AND d.round_id = pr.round_id
LEFT JOIN traded_flag tf
  ON tf.player_id = pr.player_id AND tf.round_id = pr.round_id
GROUP BY pr.player_id, pr.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS kast_per_match_player_idx
  ON kast_per_match (player_id);
CREATE INDEX IF NOT EXISTS kast_per_match_tournament_idx
  ON kast_per_match (tournament_id);
