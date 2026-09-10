-- Разделение ассистов на «за урон» и «за флешку».
--
-- FACEIT в колонку «A» ставит только ассисты уроном; флеш-ассисты у него
-- живут отдельно, в листе utility. Проверено на матче 1-0b3fd0d8: K, D, ADR,
-- HS% и K/R сошлись у всех десяти игроков точь-в-точь, а ассисты разошлись
-- ровно на число флеш-ассистов — у sckrafft 7 против 5, у clovisz 3 против 1,
-- у ALN333 4 против 3.
--
-- Флаг берётся из поля assistedflash события player_death, парсер его теперь
-- отдаёт. У уже сохранённых убийств флага нет, поэтому все они остаются
-- «за урон» — прежнее поведение; корректными станут при переимпорте.

ALTER TABLE match_kill
  ADD COLUMN IF NOT EXISTS assisted_flash BOOLEAN NOT NULL DEFAULT false;

-- Вьюшка ассистов пересобирается с исключением флеш-ассистов.
DROP MATERIALIZED VIEW IF EXISTS assist_stats_per_match CASCADE;

CREATE MATERIALIZED VIEW assist_stats_per_match AS
SELECT
  mk.assistant_id::int AS player_id,
  mk.match_id,
  m.tournament_id,
  COUNT(*)::int        AS assists
FROM match_kill mk
JOIN match m ON m.id = mk.match_id
WHERE mk.assistant_id IS NOT NULL
  AND mk.is_teamkill = false
  AND mk.assisted_flash = false
GROUP BY mk.assistant_id, mk.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS assist_stats_per_match_player_idx
  ON assist_stats_per_match (player_id);
CREATE INDEX IF NOT EXISTS assist_stats_per_match_tournament_idx
  ON assist_stats_per_match (tournament_id);

-- Флеш-ассисты отдельной вьюшкой — это лист utility.
CREATE MATERIALIZED VIEW IF NOT EXISTS flash_assist_stats_per_match AS
SELECT
  mk.assistant_id::int AS player_id,
  mk.match_id,
  m.tournament_id,
  COUNT(*)::int        AS flash_assists
FROM match_kill mk
JOIN match m ON m.id = mk.match_id
WHERE mk.assistant_id IS NOT NULL
  AND mk.is_teamkill = false
  AND mk.assisted_flash = true
GROUP BY mk.assistant_id, mk.match_id, m.tournament_id;

CREATE INDEX IF NOT EXISTS flash_assist_stats_player_idx
  ON flash_assist_stats_per_match (player_id);

-- CASCADE выше снёс зависимую вьюшку с компонентами рейтинга — пересоздаём.
CREATE MATERIALIZED VIEW IF NOT EXISTS player_rating2_components_per_match AS
SELECT
  c.player_id,
  c.match_id,
  c.tournament_id,
  c.total_rounds::int             AS rounds,
  c.kills::int                    AS kills,
  c.deaths::int                   AS deaths,
  COALESCE(a.assists, 0)::int     AS assists,
  COALESCE(d.damage, 0)::int      AS damage,
  COALESCE(k.kast_rounds, 0)::int AS kast_rounds,
  COALESCE(ks.hs_kills, 0)::int   AS hs_kills,
  c.multi_kill_rounds::int        AS multi_kill_rounds,
  c.survived_rounds::int          AS survived_rounds,
  c.traded_rounds::int            AS traded_rounds
FROM player_rating_components_per_match c
LEFT JOIN assist_stats_per_match a
  ON a.player_id = c.player_id AND a.match_id = c.match_id
LEFT JOIN damage_stats_per_match d
  ON d.player_id = c.player_id AND d.match_id = c.match_id
LEFT JOIN kast_per_match k
  ON k.player_id = c.player_id AND k.match_id = c.match_id
LEFT JOIN kill_stats_per_match ks
  ON ks.player_id = c.player_id AND ks.match_id = c.match_id;

CREATE UNIQUE INDEX IF NOT EXISTS rating2_components_pk_idx
  ON player_rating2_components_per_match (player_id, match_id);
CREATE INDEX IF NOT EXISTS rating2_components_player_idx
  ON player_rating2_components_per_match (player_id);
CREATE INDEX IF NOT EXISTS rating2_components_tournament_idx
  ON player_rating2_components_per_match (tournament_id);
