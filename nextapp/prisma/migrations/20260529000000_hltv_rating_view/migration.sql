-- Materialized view с компонентами HLTV Rating 1.0 на уровне (player, match).
-- Аналог существующих kill_stats_per_match / damage_stats_per_match / kast_per_match.
--
-- Компоненты на матч:
--   kills, deaths, total_rounds — базовые
--   multi_kill_rounds — раунды с >= 2 убийствами игрока
--   survived_rounds   — раунды, в которых игрок не умер
--   traded_rounds     — раунды, в которых игрок умер, но союзник убил его убийцу в окне 5 сек
--
-- HLTV 1.0 формула на турнир (агрегируется суммой по матчам, делится на total_rounds):
--   0.3591*(kills/R) + 0.4778*(survived/R) + 0.3658*(multi_kill/R) - 0.394*(deaths/R) + 0.2778
--
-- CS2 ~64 tick/sec; окно trade ≈ 5 сек = 320 тиков.

CREATE MATERIALIZED VIEW IF NOT EXISTS player_rating_components_per_match AS
WITH
  -- 1. Соответствие user_id -> match_team_id в каждом матче
  player_team AS (
    SELECT
      mm.user_id::int AS player_id,
      mm.match_id     AS match_id,
      mm.match_team_id AS team_id
    FROM match_member mm
    WHERE mm.user_id IS NOT NULL
      AND mm.match_id IS NOT NULL
      AND mm.match_team_id IS NOT NULL
  ),
  -- 2. Раунды матча
  match_rounds AS (
    SELECT
      r.match_id,
      r.id AS round_id,
      r.round_number
    FROM round r
  ),
  -- 3. Все участники * все раунды матча (декартово произведение)
  player_rounds AS (
    SELECT
      pt.player_id,
      pt.match_id,
      mr.round_id
    FROM player_team pt
    JOIN match_rounds mr ON mr.match_id = pt.match_id
  ),
  -- 4. Убийства игроком в раунде
  kills_by_round AS (
    SELECT
      mk.killer_id::int AS player_id,
      mk.match_id,
      mk.round_id,
      COUNT(*)::int     AS kills
    FROM match_kill mk
    WHERE mk.killer_id IS NOT NULL
      AND mk.is_teamkill = false
    GROUP BY mk.killer_id, mk.match_id, mk.round_id
  ),
  -- 5. Смерть игрока в раунде (берём первую/единственную)
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
  -- 6. Trade-флаг: убийца игрока был убит союзником в окне 320 тиков после смерти игрока
  traded_flag AS (
    SELECT
      d.player_id,
      d.match_id,
      d.round_id,
      EXISTS (
        SELECT 1
        FROM match_kill mk2
        JOIN player_team pt_avenger
          ON pt_avenger.player_id = mk2.killer_id::int
         AND pt_avenger.match_id = mk2.match_id
        JOIN player_team pt_victim
          ON pt_victim.player_id = d.player_id
         AND pt_victim.match_id = d.match_id
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
  ),
  -- 7. Агрегация по (player, round): сколько убийств, умер ли, был ли затрейжен
  per_player_round AS (
    SELECT
      pr.player_id,
      pr.match_id,
      pr.round_id,
      COALESCE(k.kills, 0)                     AS kills,
      CASE WHEN d.player_id IS NULL THEN 0 ELSE 1 END AS died,
      CASE WHEN tf.is_traded THEN 1 ELSE 0 END AS traded
    FROM player_rounds pr
    LEFT JOIN kills_by_round k
      ON k.player_id = pr.player_id
     AND k.round_id  = pr.round_id
    LEFT JOIN death_by_round d
      ON d.player_id = pr.player_id
     AND d.round_id  = pr.round_id
    LEFT JOIN traded_flag tf
      ON tf.player_id = pr.player_id
     AND tf.round_id  = pr.round_id
  )
-- 8. Свёртка по (player, match)
SELECT
  ppr.player_id,
  ppr.match_id,
  m.tournament_id,
  COUNT(*)::int                                                       AS total_rounds,
  SUM(ppr.kills)::int                                                 AS kills,
  SUM(ppr.died)::int                                                  AS deaths,
  SUM(CASE WHEN ppr.kills >= 2 THEN 1 ELSE 0 END)::int                AS multi_kill_rounds,
  SUM(CASE WHEN ppr.died = 0 THEN 1 ELSE 0 END)::int                  AS survived_rounds,
  SUM(ppr.traded)::int                                                AS traded_rounds
FROM per_player_round ppr
JOIN match m ON m.id = ppr.match_id
GROUP BY ppr.player_id, ppr.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS prc_per_match_player_idx
  ON player_rating_components_per_match (player_id);
CREATE INDEX IF NOT EXISTS prc_per_match_tournament_idx
  ON player_rating_components_per_match (tournament_id);
