-- Победитель раунда — по стороне, за которую команда играла В ЭТОМ раунде.
--
-- Предыдущая попытка (20260910010000_fix_round_winner_side_swap) выводила
-- сторону из номера раунда по правилу MR12. На реальной демке это правило
-- не работает сразу по двум причинам:
--
--   * стартовые стороны команд определялись по тику раунда с
--     total_rounds_played = 0, а первый игровой раунд у разных платформ
--     нумеруется по-разному (ножевые и разминочные раунды) — на проверенном
--     матче стороны получились перевёрнутыми;
--   * при входе в овертайм стороны меняются не всегда. На проверенном матче
--     блоки сторон шли 12 / 15 / 6 / 3 раунда, то есть 12 | 12+3 | 3+3 | 3.
--
-- Из-за этого MR12-версия разошлась с фактическими данными в 28 раундах из 35.
--
-- Здесь сторона берётся из событий самого раунда: match_kill.killer_team —
-- это сторона убийцы в момент убийства. Ни от формата матча, ни от нумерации
-- раундов это не зависит. Проверено: все 272 убийства попадают в тиковое окно
-- своего раунда, то есть по раундам они разложены верно.
--
-- Экономику (match_player_economy) для этой цели использовать нельзя: она
-- привязана к раундам со сдвигом на единицу (баг в processEconomies,
-- исправлен в коде). Пересчитывать её здесь не станем — на страницах и во
-- вьюшках она не используется, а корректной станет при переимпорте.

-- 1. Сторона каждой команды в каждом раунде — по большинству её убийств.
--    Команда, у которой в раунде убийств не было, играла за противоположную
--    сторону.
WITH observed AS (
  SELECT DISTINCT ON (k.round_id, mm.match_team_id)
         k.round_id,
         mm.match_team_id AS team_id,
         k.killer_team    AS side
  FROM match_kill k
  JOIN match_member mm
    ON mm.user_id = k.killer_id
   AND mm.match_id = k.match_id
  WHERE k.killer_id IS NOT NULL
    AND k.is_teamkill = false
  GROUP BY k.round_id, mm.match_team_id, k.killer_team
  ORDER BY k.round_id, mm.match_team_id, COUNT(*) DESC
),
resolved AS (
  SELECT r.id  AS round_id,
         mt.id AS team_id,
         COALESCE(
           o.side,
           (SELECT CASE WHEN o2.side = 2 THEN 3 ELSE 2 END
              FROM observed o2
             WHERE o2.round_id = r.id
               AND o2.team_id <> mt.id
             LIMIT 1)
         ) AS side
  FROM round r
  JOIN match_team mt ON mt.match_id = r.match_id
  LEFT JOIN observed o ON o.round_id = r.id AND o.team_id = mt.id
)
UPDATE round r
SET win_match_team_id = res.team_id
FROM resolved res
WHERE res.round_id = r.id
  AND res.side = r.win_team_num
  AND r.win_match_team_id IS DISTINCT FROM res.team_id;

-- 2. Счёт = число выигранных раундов. Матчи без разобранных раундов не трогаем.
UPDATE match_team mt
SET score = COALESCE(
      (SELECT COUNT(*)::int FROM round r WHERE r.win_match_team_id = mt.id),
      0
    )
WHERE EXISTS (SELECT 1 FROM round r WHERE r.match_id = mt.match_id);

-- 3. Победитель матча — команда с наибольшим счётом; при ничьей не назначаем.
WITH best AS (
  SELECT match_id, MAX(score) AS best_score
  FROM match_team
  GROUP BY match_id
),
single_winner AS (
  SELECT mt.match_id
  FROM match_team mt
  JOIN best b ON b.match_id = mt.match_id AND mt.score = b.best_score
  GROUP BY mt.match_id
  HAVING COUNT(*) = 1 AND MAX(mt.score) > 0
)
UPDATE match_team mt
SET is_winner = (mt.score = b.best_score)
FROM best b
JOIN single_winner sw ON sw.match_id = b.match_id
WHERE b.match_id = mt.match_id;
