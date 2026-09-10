-- Цены оружия в справочнике: несколько значений не совпадали с магазином CS2.
--
-- Раньше поле cost нигде в приложении не читалось, поэтому ошибки не были
-- заметны. Со страницей матча оно становится видимым: по нему считается,
-- на сколько закупилась команда в раунде.
--
-- Что было не так:
--   sg556          $300 вместо $3000 — потерян ноль, оружие выглядело
--                  дешевле пистолета
--   m4a1 (M4A4)    $2900 вместо $3100
--   m4a1_silencer  $3000 вместо $2900 — две M4 были перепутаны между собой
--   famas          $1800 вместо $2050
--   inferno        $500 вместо $600
--   elite          $0 вместо $300
--
-- Проверялось по магазину CS2; цены не менялись с 2023 года.

UPDATE weapon SET cost = 3000 WHERE name = 'sg556';
UPDATE weapon SET cost = 3100 WHERE name = 'm4a1';
UPDATE weapon SET cost = 2900 WHERE name = 'm4a1_silencer';
UPDATE weapon SET cost = 2050 WHERE name = 'famas';
UPDATE weapon SET cost = 600  WHERE name = 'inferno';
UPDATE weapon SET cost = 300  WHERE name = 'elite';

-- Внутреннее имя P90 было скопировано у XM1014.
UPDATE weapon SET internal_name = 'p90' WHERE name = 'p90';

-- Оружие, которого в справочнике не было. Пока его никто не подбирал,
-- строки не появлялись; когда появятся, они заводятся автоматически
-- с ценой 0 — и закупка окажется занижена. Заводим заранее.
INSERT INTO weapon (name, type, internal_name, inventory_name, cost)
VALUES
  ('nova',      'shotgun',    'nova',      'Nova',            1050),
  ('sawedoff',  'shotgun',    'sawedoff',  'Sawed-Off',       1100),
  ('cz75a',     'pistol',     'cz75a',     'CZ75-Auto',        500),
  ('scar20',    'sniper',     'scar20',    'SCAR-20',         5000),
  ('g3sg1',     'sniper',     'g3sg1',     'G3SG1',           5000),
  ('negev',     'machinegun', 'negev',     'Negev',           1700),
  ('taser',     'equipment',  'taser',     'Zeus x27',         200),
  ('decoy',     'grenade',    'decoy',     'Decoy Grenade',     50)
ON CONFLICT (name) DO UPDATE SET cost = EXCLUDED.cost;
