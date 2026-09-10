-- Цена каждого убийства и вклад игрока в исход раундов.
--
-- Swing — насколько убийство подвинуло шанс команды убийцы выиграть раунд.
-- Считается в cs-parser/swing-model.js по таблице шансов: положение в раунде
-- задаётся числом живых с каждой стороны и состоянием бомбы. Убийце
-- начисляется плюс, погибшему ровно столько же минус, поэтому сумма swing
-- по всем игрокам матча равна нулю.
--
-- Зачем. Убийства не равны друг другу: фраг на отходе в проигранном раунде
-- попадает в K и ADR наравне с фрагом, который раунд выиграл. Замеры по
-- 185 раундам: обычное убийство двигает шанс на 0.170, exit-фраг — на 0.034,
-- а убийство после разминирования не двигает вообще.
--
-- Проверено против FACEIT: swing коррелирует с их колонкой Swing на r = 0.967
-- (20 игроков, 2 матча), и как одиночный предиктор их рейтинга даёт r = 0.954
-- против 0.883 у HLTV 2.0.

ALTER TABLE match_kill
  ADD COLUMN IF NOT EXISTS swing DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS is_exit_frag BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_dead_rubber BOOLEAN NOT NULL DEFAULT false;

-- Вклад игрока за матч: приобретённое своими убийствами минус потерянное
-- собственными смертями.
CREATE MATERIALIZED VIEW IF NOT EXISTS player_swing_per_match AS
WITH gained AS (
  SELECT mk.killer_id::int AS player_id, mk.match_id,
         SUM(mk.swing)                                   AS swing_gained,
         COUNT(*) FILTER (WHERE mk.is_exit_frag)::int     AS exit_frags,
         COUNT(*) FILTER (WHERE mk.is_dead_rubber)::int   AS dead_rubber_frags,
         COUNT(*) FILTER (WHERE mk.swing >= 0.25)::int    AS impact_frags,
         COUNT(*)::int                                    AS kills
  FROM match_kill mk
  WHERE mk.killer_id IS NOT NULL AND mk.swing IS NOT NULL
  GROUP BY mk.killer_id, mk.match_id
),
lost AS (
  SELECT mk.victim_id::int AS player_id, mk.match_id,
         SUM(mk.swing) AS swing_lost
  FROM match_kill mk
  WHERE mk.swing IS NOT NULL
  GROUP BY mk.victim_id, mk.match_id
),
ids AS (
  SELECT player_id, match_id FROM gained
  UNION
  SELECT player_id, match_id FROM lost
)
SELECT
  i.player_id,
  i.match_id,
  m.tournament_id,
  COALESCE(g.swing_gained, 0) - COALESCE(l.swing_lost, 0) AS swing,
  COALESCE(g.swing_gained, 0)          AS swing_gained,
  COALESCE(l.swing_lost, 0)            AS swing_lost,
  COALESCE(g.exit_frags, 0)            AS exit_frags,
  COALESCE(g.dead_rubber_frags, 0)     AS dead_rubber_frags,
  COALESCE(g.impact_frags, 0)          AS impact_frags,
  COALESCE(g.kills, 0)                 AS scored_kills
FROM ids i
JOIN match m ON m.id = i.match_id
LEFT JOIN gained g ON g.player_id = i.player_id AND g.match_id = i.match_id
LEFT JOIN lost   l ON l.player_id = i.player_id AND l.match_id = i.match_id;

CREATE UNIQUE INDEX IF NOT EXISTS player_swing_per_match_pk_idx
  ON player_swing_per_match (player_id, match_id);
CREATE INDEX IF NOT EXISTS player_swing_per_match_tournament_idx
  ON player_swing_per_match (tournament_id);
