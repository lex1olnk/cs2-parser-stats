-- Две вещи, без которых /api/stats/stats возвращает 500 и пустые числа.
--
-- 1. match_kill_with_trade — вьюшка, на которую роут ссылается, но которой
--    нигде не создавалось. Помечает убийство как размен (trade kill): жертва
--    этого убийства сама только что убила союзника убийцы.
--    Окно размена — 320 тиков (~5 сек при 64 tick), как в остальных вьюшках.
--
-- 2. weapon.type у всех записей был NULL: getOrCreateWeapon его не заполнял,
--    а mapWeaponType искал в названиях подстроки "rifle"/"pistol", которых
--    во внутренних именах CS2 (ak47, deagle, hegrenade) нет в принципе.
--    Из-за этого фильтр weapon.type = 'grenade' не находил ничего.

-- ---------------------------------------------------------------------------
-- Размены
-- ---------------------------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS match_kill_with_trade AS
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
  mk.*,
  EXISTS (
    SELECT 1
    FROM match_kill prev
    JOIN player_team pt_killer
      ON pt_killer.player_id = mk.killer_id::int
     AND pt_killer.match_id  = mk.match_id
    JOIN player_team pt_fallen
      ON pt_fallen.player_id = prev.victim_id::int
     AND pt_fallen.match_id  = prev.match_id
    WHERE prev.round_id = mk.round_id
      -- жертва нашего убийства ранее убила союзника убийцы
      AND prev.killer_id::int = mk.victim_id
      AND pt_fallen.team_id = pt_killer.team_id
      AND prev.tick <= mk.tick
      AND mk.tick - prev.tick <= 320
  ) AS is_tradekill
FROM match_kill mk
WHERE mk.killer_id IS NOT NULL;

-- Уникальный индекс по id: нужен, чтобы при росте объёмов можно было делать
-- REFRESH MATERIALIZED VIEW CONCURRENTLY без блокировки читателей.
CREATE UNIQUE INDEX IF NOT EXISTS match_kill_with_trade_id_idx
  ON match_kill_with_trade (id);
CREATE INDEX IF NOT EXISTS match_kill_with_trade_killer_idx
  ON match_kill_with_trade (killer_id);
CREATE INDEX IF NOT EXISTS match_kill_with_trade_match_idx
  ON match_kill_with_trade (match_id);

-- ---------------------------------------------------------------------------
-- Категории оружия по внутренним именам CS2
-- ---------------------------------------------------------------------------
UPDATE weapon SET "type" = CASE
  WHEN name IN ('hegrenade', 'flashbang', 'smokegrenade', 'molotov',
                'incgrenade', 'inferno', 'decoy')                  THEN 'grenade'
  WHEN name IN ('knife', 'knife_t', 'bayonet')                     THEN 'melee'
  WHEN name IN ('deagle', 'elite', 'fiveseven', 'glock', 'hkp2000',
                'p250', 'revolver', 'tec9', 'usp_silencer', 'cz75a') THEN 'pistol'
  WHEN name IN ('bizon', 'mac10', 'mp5sd', 'mp7', 'mp9', 'p90',
                'ump45')                                           THEN 'smg'
  WHEN name IN ('ak47', 'aug', 'famas', 'galilar', 'm4a1',
                'm4a1_silencer', 'sg556')                          THEN 'rifle'
  WHEN name IN ('awp', 'ssg08', 'scar20', 'g3sg1')                 THEN 'sniper'
  WHEN name IN ('mag7', 'nova', 'sawedoff', 'xm1014')              THEN 'shotgun'
  WHEN name IN ('m249', 'negev')                                   THEN 'machinegun'
  WHEN name IN ('kevlar', 'kevlar_helmet', 'defuse', 'taser')      THEN 'equipment'
  ELSE 'other'
END
WHERE "type" IS NULL;
