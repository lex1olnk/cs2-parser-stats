// anti-achievements-defs.js

/**
 * Определения Анти-Достижений для Раздела "КУБОК НЕГАТИВА".
 *
 * Каждое достижение содержит:
 * - id: Уникальный идентификатор.
 * - title: Название, которое увидит пользователь.
 * - description: Условие получения.
 * - category: Категория провала (для фильтрации).
 * - check: Функция (stats) => boolean, проверяющая, достигнуто ли.
 * - progress: Функция (stats) => number, возвращающая текущий прогресс.
 * - target: Целевое значение для прогресс-бара.
 *
 * ПРИМЕЧАНИЕ: Метрики teamDamageTotal, selfFlashCount, selfDamageGrenade должны
 * быть рассчитаны в calculateNegativeMetrics.
 */
const ANTI_ACHIEVEMENT_DEFINITIONS = [
  // --- УРОН ПО СЕБЕ И ТИММЕЙТАМ ---

  {
    id: "TEAM_MATE_HATER",
    title: "Тиммейт-Ненавистник",
    description: "Нанести тиммейтам более 250 HP урона за матч.",
    category: "Team Damage",
    check: (stats) => stats.teamDamageTotal >= 250,
    progress: (stats) => Math.min(stats.teamDamageTotal, 250),
    target: 250,
  },
  {
    id: "SUICIDE_BOMBER",
    title: "Бомбардир-Самоубийца",
    description:
      "Нанести себе урон от гранат (HE/Molotov) более 100 HP за матч.",
    category: "Self Harm",
    check: (stats) => stats.selfDamageGrenade >= 100,
    progress: (stats) => Math.min(stats.selfDamageGrenade, 100),
    target: 100,
  },

  // --- НЕПРАВИЛЬНОЕ ИСПОЛЬЗОВАНИЕ ГРАНАТ ---

  {
    id: "FOGGY_KNIGHT",
    title: "Туманный Рыцарь",
    description: "Ослепить самого себя 10 раз за матч.",
    category: "Utility Misuse",
    check: (stats) => stats.selfFlashCount >= 10,
    progress: (stats) => Math.min(stats.selfFlashCount, 10),
    target: 10,
  },
  {
    id: "ECONOMY_MAGNATE",
    title: "Магнат Переброса",
    description: "Купить HE гранату, но ни разу не использовать ее за матч.",
    category: "Economy",
    // ВНИМАНИЕ: Требует парсинга покупок (boughtHE) и бросков гранат (thrownHE)
    check: (stats) => stats.boughtHE > 0 && stats.thrownHE === 0,
    progress: (stats) => (stats.boughtHE > 0 && stats.thrownHE === 0 ? 1 : 0),
    target: 1,
  },

  // --- НЕЭФФЕКТИВНОСТЬ ---

  {
    id: "NO_IMPACT",
    title: "Нулевой Импульс",
    description:
      "Закончить матч без единого убийства и ассиста (Kills + Assists = 0).",
    category: "Performance",
    // Метрики Kills и Assists берутся из calculatePlayerStats, поэтому нам
    // нужно либо передать их, либо использовать stats (чтобы избежать лишней зависимости)
    check: (stats) => stats.kills === 0 && stats.assists === 0,
    progress: (stats) => (stats.kills === 0 && stats.assists === 0 ? 0 : 1), // 0 = провал, 1 = избежал провала
    target: 1,
  },
  {
    id: "THE_GHOST",
    title: "Призрак",
    description:
      "Провести на точке закладки или разминирования менее 5 секунд за матч.",
    category: "Positioning",
    // ВНИМАНИЕ: Требует парсинга времени на точках (Place/Defuse time) - пока недоступно.
    check: (stats) => stats.timeNearBombSite < 5,
    progress: (stats) => Math.min(stats.timeNearBombSite, 5),
    target: 5,
  },
];

module.exports = { ANTI_ACHIEVEMENT_DEFINITIONS };
