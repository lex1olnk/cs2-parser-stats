-- Исправление победителя раунда с учётом смены сторон в перерыве.
--
-- processRounds в database-service определял команду-победителя как
--   teamsMap.get(round.winner === 'T' ? 2 : 3)
-- то есть по стороне, на которой команда НАЧАЛА матч. После swap на стороне T
-- играет уже другая команда, поэтому все раунды второй половины и овертаймов
-- приписывались противнику. Парсер эту проблему решает отдельно
-- (resolveRoundWinnerLabel / winnerTeamLabel), но результат не использовался.
--
-- На проверенном матче расходились 18 раундов из 36: в базе лежало 25:11,
-- на деле 19:17. Счёт 25:11 в MR12 невозможен в принципе — матч закончился бы
-- на 13-м раунде, что и выдало ошибку.
--
-- Это же делает неверным счёт, восстановленный миграцией
-- 20260910000000_backfill_match_team_score: она считала его по round.
-- win_match_team_id, то есть по испорченным данным. Поэтому здесь сначала
-- чинятся раунды, а затем счёт пересчитывается заново.
--
-- Правило swap — MR12, ровно как в парсере: раунды 1..12 без swap, 13..24
-- со swap, дальше овертайм блоками по три. В базе round_number на единицу
-- меньше номера раунда у парсера, отсюда (round_number + 1).

-- 1. Переназначаем победителя раунда: ищем команду, которая в этом раунде
--    играла на выигравшей стороне.
UPDATE round r
SET win_match_team_id = mt.id
FROM match_team mt
WHERE mt.match_id = r.match_id
  AND mt.team_num IS NOT NULL
  AND r.win_team_num = CASE
        WHEN CASE
               WHEN (r.round_number + 1) <= 12 THEN false
               WHEN (r.round_number + 1) <= 24 THEN true
               ELSE (((r.round_number + 1 - 25) / 3) % 2) = 1
             END
        THEN CASE WHEN mt.team_num = 2 THEN 3 ELSE 2 END
        ELSE mt.team_num
      END
  AND r.win_match_team_id IS DISTINCT FROM mt.id;

-- 2. Счёт = число выигранных раундов. В отличие от прошлой миграции
--    перезаписываем безусловно: там могло остаться неверное ненулевое
--    значение. Матчи без разобранных раундов не трогаем.
UPDATE match_team mt
SET score = COALESCE(
      (SELECT COUNT(*)::int FROM round r WHERE r.win_match_team_id = mt.id),
      0
    )
WHERE EXISTS (SELECT 1 FROM round r WHERE r.match_id = mt.match_id);

-- 3. Победитель матча — команда с наибольшим счётом. При ничьей победителя
--    не назначаем.
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
