-- Бэкфилл счёта команд в уже залитых матчах.
--
-- createTeams в database-service писал score = 0 и is_winner = false
-- захардкоженными значениями, хотя парсер (parseTeamsInfo) считает и то,
-- и другое. Из-за этого каждый матч в базе выглядел как 0:0 без победителя:
-- и на /matches, и в /api/matches, откуда список матчей читает главная.
--
-- Сам источник ошибки исправлен в коде; здесь чиним уже сохранённые строки.
-- Счёт восстанавливается по round.win_match_team_id — это те же раунды,
-- по которым парсер и считал счёт, так что результат совпадает.

-- 1. Счёт = число выигранных раундов. Трогаем только строки-заглушки
--    (score = 0): матч, где команда действительно не взяла ни одного раунда,
--    в round_wins просто не встретится и останется нулём.
WITH round_wins AS (
  SELECT win_match_team_id AS team_id, COUNT(*)::int AS wins
  FROM round
  GROUP BY win_match_team_id
)
UPDATE match_team mt
SET score = rw.wins
FROM round_wins rw
WHERE rw.team_id = mt.id
  AND mt.score = 0;

-- 2. Победитель — команда с наибольшим счётом в матче. При ничьей
--    (или если счёт восстановить не удалось) победителя не назначаем.
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
