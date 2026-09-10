-- Компоненты HLTV Rating 2.0 на уровне (игрок, матч).
--
-- Это тот рейтинг, который показывает FACEIT в своей статистике матча.
-- Регрессия HLTV 2.0:
--
--   Impact = 2.13*KPR + 0.42*APR - 0.41
--   Rating = 0.0073*KAST + 0.3591*KPR - 0.5329*DPR
--          + 0.2372*Impact + 0.0032*ADR + 0.1587
--
-- где KPR/DPR/APR — убийства, смерти и ассисты за раунд, ADR — урон за раунд,
-- KAST — процент раундов с убийством, ассистом, выживанием или разменом.
--
-- Чем это отличается от прежней формулы. В коде считалось
--   0.3591*KPR + 0.4778*SPR + 0.3658*RMK - 0.394*DPR + 0.2778
-- и подписывалось как «HLTV Rating 1.0». Настоящей 1.0 это не было: коэффициент
-- при KPR взят из регрессии 2.0, остальные слагаемые ни к одной из формул
-- не относятся. На проверенном матче нормальный игрок получал ~0.76 вместо
-- ~1.35, и весь лидерборд выглядел так, будто все играют плохо.
--
-- ВАЖНО про агрегацию. Рейтинг за несколько матчей нельзя получить средним
-- из рейтингов за матч: формула нелинейна по раундам. Поэтому вьюшка отдаёт
-- только СЛАГАЕМЫЕ, а рейтинг считается уже над суммой компонентов —
-- так же, как это делает HLTV.

CREATE MATERIALIZED VIEW IF NOT EXISTS player_rating2_components_per_match AS
SELECT
  c.player_id,
  c.match_id,
  c.tournament_id,
  c.total_rounds::int                     AS rounds,
  c.kills::int                            AS kills,
  c.deaths::int                           AS deaths,
  COALESCE(a.assists, 0)::int             AS assists,
  COALESCE(d.damage, 0)::int              AS damage,
  COALESCE(k.kast_rounds, 0)::int         AS kast_rounds,
  -- Хедшоты и мультикиллы здесь же, чтобы страницам не собирать их
  -- отдельным джойном к kill_stats_per_match.
  COALESCE(ks.hs_kills, 0)::int           AS hs_kills,
  c.multi_kill_rounds::int                AS multi_kill_rounds,
  c.survived_rounds::int                  AS survived_rounds,
  c.traded_rounds::int                    AS traded_rounds
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
