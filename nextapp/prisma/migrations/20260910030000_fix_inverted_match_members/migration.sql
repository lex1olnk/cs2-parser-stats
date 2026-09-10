-- Состав матча мог целиком уехать в команду соперника.
--
-- processPlayers привязывал игрока к команде через
--   teamsMap.get(player.teamNumber)
-- где teamNumber — сторона из parsePlayerInfo на один фиксированный момент
-- демки, а ключи teamsMap — стартовые стороны команд. Если к этому моменту
-- стороны успели поменяться, все игроки матча получали чужую команду.
--
-- Инверсия глобальная (обе команды меняются местами), поэтому отношение
-- "свой / чужой" сохраняется: материализованные вьюшки, которые используют
-- состав только чтобы отличить союзника от соперника (урон, KAST, размены,
-- компоненты рейтинга), считались верно и пересчёта не требуют. Неверной
-- была именно принадлежность игрока к конкретной строке match_team — то есть
-- к названию и счёту команды.
--
-- Проверено на двух матчах: в одном привязка верная (272 убийства из 272
-- согласованы), в другом инвертирована целиком (135 из 135).
--
-- Критерий: убийца, попавший в раунде по выигравшей стороне, должен состоять
-- в команде-победителе этого раунда. Победитель раунда к этому моменту уже
-- исправлен миграцией 20260910020000 и берётся за истину.

WITH ev AS (
  SELECT k.match_id,
         (k.killer_team = r.win_team_num)          AS killed_on_winning_side,
         (mm.match_team_id = r.win_match_team_id)  AS member_of_winning_team
  FROM match_kill k
  JOIN round r ON r.id = k.round_id
  JOIN match_member mm
    ON mm.user_id = k.killer_id
   AND mm.match_id = k.match_id
  WHERE k.killer_id IS NOT NULL
    AND k.is_teamkill = false
),
verdict AS (
  SELECT match_id
  FROM ev
  GROUP BY match_id
  -- Меняем только там, где противоречий строгое большинство: единичные
  -- расхождения — это шум в данных, а не инверсия состава.
  HAVING COUNT(*) FILTER (WHERE killed_on_winning_side <> member_of_winning_team)
         > COUNT(*) FILTER (WHERE killed_on_winning_side = member_of_winning_team)
),
two_team_matches AS (
  -- Меняться местами есть чему только в матчах ровно с двумя командами.
  SELECT match_id FROM match_team GROUP BY match_id HAVING COUNT(*) = 2
)
UPDATE match_member mm
SET match_team_id = other.id
FROM match_team mine
JOIN match_team other
  ON other.match_id = mine.match_id
 AND other.id <> mine.id
WHERE mm.match_team_id = mine.id
  AND mm.match_id IN (SELECT match_id FROM verdict)
  AND mm.match_id IN (SELECT match_id FROM two_team_matches);
