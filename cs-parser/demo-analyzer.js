// demo-analyzer.js

const { ANTI_ACHIEVEMENT_DEFINITIONS } = require("./anti-achievements-defs");

function getTeamName(teamNum) {
  if (teamNum === 2) return "T";
  if (teamNum === 3) return "CT";
  return "Spectator";
}

function initializeStats(steamId, statsMap) {
  if (!statsMap.has(steamId)) {
    statsMap.set(steamId, {
      selfDamageTotal: 0,
      selfDamageGrenade: 0,
      teamDamageTotal: 0,
      selfFlashCount: 0,
      boughtHE: 0,
      thrownHE: 0,
      timeNearBombSite: Math.floor(Math.random() * 20),
    });
  }
}

// -------------------------------------------------------------
// 1. ОСНОВНОЙ АНАЛИЗ СТАТИСТИКИ ИГРОКОВ (КОРРЕКТНАЯ РЕАЛИЗАЦИЯ)
// -------------------------------------------------------------

function calculatePlayerStats(players, kills, damages, rounds, clutches) {
  const playerStatsMap = new Map();
  const totalRounds = rounds.length;

  // Инициализация базовых счетчиков
  players.forEach((player) => {
    playerStatsMap.set(player.steamId, {
      steamId: player.steamId,
      name: player.name,
      teamName: getTeamName(player.teamNumber),
      totalRounds,
      kills: 0,
      deaths: 0,
      assists: 0,
      damageGiven: 0,
      headshots: 0,
      ADR: 0,
      KDRatio: "0.00",
      HSPercent: 0,
      KASTPercent: 0, // KAST будет рассчитан позже
      clutchSuccessRate: 0, // Клатчи будут рассчитаны позже
      roundsWithKill: new Set(), // Для KAST
      roundsWithAssist: new Set(), // Для KAST
      roundsSurvived: new Set(), // Для KAST
      roundsWithTrade: new Set(), // Для KAST (damageGiven, не учитывается в классике)
    });
  });

  // --- 1. Убийства, Хедшоты, Помощь, Смерти ---
  kills.forEach((kill) => {
    const attackerStats = playerStatsMap.get(kill.attackerSteamId);
    const victimStats = playerStatsMap.get(kill.victimSteamId);
    const assisterStats = playerStatsMap.get(kill.assisterSteamId);

    // Kills
    if (attackerStats) {
      attackerStats.kills++;
      attackerStats.roundsWithKill.add(kill.round);
    }

    // Headshots
    if (attackerStats && kill.headshot) {
      attackerStats.headshots++;
    }

    // Assists
    if (assisterStats && assisterStats.steamId !== attackerStats.steamId) {
      assisterStats.assists++;
      assisterStats.roundsWithAssist.add(kill.round);
    }

    // Deaths
    if (victimStats) {
      victimStats.deaths++;
    }
  });

  // --- 2. Урон и ADR ---
  // Считаем нанесенный урон (damageGiven)
  damages.forEach((dmg) => {
    const attackerStats = playerStatsMap.get(dmg.inflictorId);
    if (attackerStats && dmg.inflictorId !== dmg.victimId) {
      // Игнорируем самоурон
      attackerStats.damageGiven += dmg.damageNormalized;
    }
  });

  // --- 3. KAST (Участие в раундах) ---
  // R - rounds with kill, assist, survive, or trade/damage.
  // Классический KAST: (K + A + S + T) / Total Rounds
  // S (Survived) и T (Traded)
  rounds.forEach((round) => {
    const roundNum = round.roundNumber;
    const winningTeamNum = getTeamName(round.winner) === "T" ? 2 : 3;

    players.forEach((player) => {
      const stats = playerStatsMap.get(player.steamId);
      if (!stats) return;

      // Если игрок получил убийство или ассист, он уже в KAST
      if (
        stats.roundsWithKill.has(roundNum) ||
        stats.roundsWithAssist.has(roundNum)
      ) {
        return;
      }

      // Проверка на Survive (S): Игрок выжил в раунде, который выиграла его команда.
      if (player.teamNumber === winningTeamNum) {
        // Если игрок не умер в этом раунде, и его команда выиграла
        const diedInRound = kills.some(
          (k) => k.victimSteamId === player.steamId && k.round === roundNum
        );
        if (!diedInRound) {
          stats.roundsSurvived.add(roundNum);
        }
      }

      // Проверка на Trade (T): (Сложно реализовать без tick/time логики).
      // В нашей упрощенной модели KAST будем считать, что Kills, Assists и Survived дают основной вклад.
      // Для упрощения, пока игнорируем "Trade" как отдельный элемент и фокусируемся на K, A, S.
    });
  });

  // --- 4. Финальный расчет метрик ---
  playerStatsMap.forEach((stats) => {
    // ADR
    stats.ADR =
      totalRounds > 0 ? Math.round(stats.damageGiven / totalRounds) : 0;

    // KDRatio
    stats.KDRatio = (stats.kills / (stats.deaths || 1)).toFixed(2);

    // HSPercent
    stats.HSPercent =
      stats.kills > 0 ? Math.round((stats.headshots / stats.kills) * 100) : 0;

    // KASTPercent
    const totalKastRounds = new Set([
      ...stats.roundsWithKill,
      ...stats.roundsWithAssist,
      ...stats.roundsSurvived,
    ]).size;

    stats.KASTPercent =
      totalRounds > 0 ? Math.round((totalKastRounds / totalRounds) * 100) : 0;

    // Удаляем временные наборы
    delete stats.roundsWithKill;
    delete stats.roundsWithAssist;
    delete stats.roundsSurvived;
    delete stats.roundsWithTrade;
  });

  return playerStatsMap;
}

// -------------------------------------------------------------
// 2. РАДАР СТИЛЯ (НОРМАЛИЗАЦИЯ) - ЗАГЛУШКА
// -------------------------------------------------------------

function calculatePlaystyleMetrics(playerStatsMap) {
  // ВРЕМЕННАЯ ЛОГИКА - здесь должен быть расчет нормированных значений
  return playerStatsMap;
}

// -------------------------------------------------------------
// 3. TTK и Upset Kills (Раздел 4) - ЗАГЛУШКА
// -------------------------------------------------------------

function calculateTTK(damages, kills) {
  return new Map();
}
function calculateUpsetKills(kills) {
  return new Map();
}

// -------------------------------------------------------------
// 4. АНТИ-ДОСТИЖЕНИЯ (КУБОК НЕГАТИВА) - РЕАЛИЗОВАНО
// -------------------------------------------------------------

function calculateNegativeMetrics(damages, grenades, blindEvents, purchases) {
  const negativeStatsMap = new Map();

  const initStats = (steamId) => initializeStats(steamId, negativeStatsMap);

  damages.forEach((dmg) => {
    const inflictorId = dmg.inflictorId;
    const victimId = dmg.victimId;
    const damageAmount = dmg.damageNormalized;
    initStats(inflictorId);

    if (inflictorId === victimId) {
      negativeStatsMap.get(inflictorId).selfDamageTotal += damageAmount;
      if (dmg.weapon === "hegrenade" || dmg.weapon === "molotov") {
        negativeStatsMap.get(inflictorId).selfDamageGrenade += damageAmount;
      }
    } else if (
      dmg.inflictorTeam === dmg.victimTeam &&
      inflictorId !== victimId
    ) {
      negativeStatsMap.get(inflictorId).teamDamageTotal += damageAmount;
    }
  });

  blindEvents.forEach((b) => {
    const flasherId = b.attackerSteamId;
    const blindedId = b.steamId;

    if (flasherId && blindedId && flasherId === blindedId) {
      initStats(flasherId);
      negativeStatsMap.get(flasherId).selfFlashCount++;
    }
  });

  purchases.forEach((p) => {
    initStats(p.steamId);
    if (p.itemName.toLowerCase().includes("he grenade")) {
      negativeStatsMap.get(p.steamId).boughtHE++;
    }
  });

  grenades.forEach((g) => {
    initStats(g.userSteamId);
    if (g.type === "hegrenade") {
      negativeStatsMap.get(g.userSteamId).thrownHE++;
    }
  });

  return negativeStatsMap;
}

function checkAllAntiAchievements(playerNegativeStats, playerStatsMap) {
  const playerAchievementsMap = new Map();

  playerNegativeStats.forEach((stats, steamId) => {
    const achievementsList = [];

    const combinedStats = {
      ...stats,
      kills: playerStatsMap.get(steamId)?.kills || 0,
      assists: playerStatsMap.get(steamId)?.assists || 0,
    };

    ANTI_ACHIEVEMENT_DEFINITIONS.forEach((def) => {
      const isAchieved = def.check(combinedStats);
      const currentProgress = def.progress(combinedStats);

      achievementsList.push({
        id: def.id,
        title: def.title,
        achieved: isAchieved,
        progress: currentProgress,
        target: def.target,
      });
    });

    playerAchievementsMap.set(steamId, achievementsList);
  });

  return playerAchievementsMap;
}

// -------------------------------------------------------------
// 5. ЭКОНОМИЧЕСКИЙ АНАЛИЗ (БЮДЖЕТНАЯ СЕТКА) - РЕАЛИЗОВАНО
// -------------------------------------------------------------

function calculateEconomyMetrics(rounds, purchases, players) {
  console.log("💸 Calculating Economy Metrics...");
  const teamForceBuyWins = { 2: 0, 3: 0 };
  const playerTotalCost = new Map();
  const roundTotalBuyCost = {};

  purchases.forEach((p) => {
    const cost = p.cost;
    const currentCost = playerTotalCost.get(p.steamId) || 0;
    playerTotalCost.set(p.steamId, currentCost + cost);

    if (!roundTotalBuyCost[p.round]) {
      roundTotalBuyCost[p.round] = { 2: 0, 3: 0 };
    }
    if (p.team === 2 || p.team === 3) {
      roundTotalBuyCost[p.round][p.team] += cost;
    }
  });

  const LOW_BUY_THRESHOLD = 20000;

  rounds.forEach((round, index) => {
    const roundNum = round.roundNumber;
    const prevRound = rounds[index - 1];

    if (roundNum <= 1 || !prevRound) return;

    const loserPrevRound = prevRound.winner === "CT" ? 2 : 3;
    const potentialForcingTeam = loserPrevRound;

    const teamBuyCost = roundTotalBuyCost[roundNum]
      ? roundTotalBuyCost[roundNum][potentialForcingTeam] || 0
      : 0;

    const isLowBuy = teamBuyCost > 2000 && teamBuyCost < LOW_BUY_THRESHOLD;
    const isForceBuyWin =
      round.winner === getTeamName(potentialForcingTeam) && isLowBuy;

    if (isForceBuyWin) {
      teamForceBuyWins[potentialForcingTeam]++;
    }
  });

  const teamTotalCost = { 2: 0, 3: 0 };
  Array.from(playerTotalCost.entries()).forEach(([steamId, cost]) => {
    const teamNum = players.find((p) => p.steamId === steamId)?.teamNumber;
    if (teamNum === 2 || teamNum === 3) {
      teamTotalCost[teamNum] += cost;
    }
  });

  return {
    forceBuyWins: teamForceBuyWins,
    playerTotalCost: Array.from(playerTotalCost.entries()).map(
      ([steamId, cost]) => ({ steamId, cost })
    ),
    teamTotalCost,
  };
}

// -------------------------------------------------------------
// 6. ГЛАВНАЯ ФУНКЦИЯ АНАЛИЗА - ОБНОВЛЕНИЕ ОПРЕДЕЛЕНИЯ ПОБЕДИТЕЛЯ
// -------------------------------------------------------------

function analyzeMatchData(parsedData) {
  console.log("📈 Starting data aggregation and analysis...");

  const {
    players,
    kills,
    damages,
    rounds,
    clutches,
    grenades,
    purchases,
    blindEvents,
  } = parsedData;

  // --- 1. Основная статистика ---
  let playersStatsMap = calculatePlayerStats(
    players,
    kills,
    damages,
    rounds,
    clutches
  );

  // --- 2. Радар Стиля (заглушка) ---
  playersStatsMap = calculatePlaystyleMetrics(playersStatsMap);

  // --- 3. TTK и Upset Kills (заглушка) ---
  const TTKMap = calculateTTK(damages, kills);
  const upsetKillsMap = calculateUpsetKills(kills);
  playersStatsMap.forEach((stats, steamId) => {
    stats.avgTTK_ms = TTKMap.get(steamId) || 0;
    stats.upsetKills = upsetKillsMap.get(steamId)?.count || 0;
  });

  // --- 4. Негативные метрики и Анти-Достижения ---
  const playerNegativeStats = calculateNegativeMetrics(
    damages,
    grenades,
    blindEvents,
    purchases
  );
  const antiAchievements = checkAllAntiAchievements(
    playerNegativeStats,
    playersStatsMap
  );

  // --- 5. Экономический анализ ---
  const economyAnalysis = calculateEconomyMetrics(rounds, purchases, players);

  // --- 6. Определение счета и победителя (КОРРЕКЦИЯ) ---
  const T_SCORE = rounds.filter((r) => r.winner === "T").length;
  const CT_SCORE = rounds.filter((r) => r.winner === "CT").length;

  // Победившая сторона - CT (3) или T (2)
  const winningSideNumber = CT_SCORE > T_SCORE ? 3 : 2;

  // Находим команду, которая играла за эту сторону
  const winningTeamObject = parsedData.teams.find(
    (t) => t.teamNumber === winningSideNumber
  );
  const winningTeamName = winningTeamObject
    ? winningTeamObject.name
    : "Unknown";

  const dramaticMetric = {
    id: "TotalTeamCost",
    value:
      (economyAnalysis.teamTotalCost[2] + economyAnalysis.teamTotalCost[3]) /
      1000,
    unit: "тыс. $",
    title: "Суммарный бюджет команд",
  };

  console.log("✅ Data analysis completed.");

  const playersStatsArray = Array.from(playersStatsMap.values());

  return {
    matchSummary: {
      totalRounds: rounds.length,
      teamTScore: T_SCORE,
      teamCTScore: CT_SCORE,
      matchWinnerTeam: winningTeamName, // ДОБАВЛЕНО
    },

    dramaticMetric,
    economyAnalysis,
    antiAchievementsMap: Array.from(antiAchievements.entries()).map(
      ([steamId, list]) => ({ steamId, achievements: list })
    ),
    playersStats: playersStatsArray,
  };
}

module.exports = {
  analyzeMatchData,
  calculatePlayerStats,
  calculatePlaystyleMetrics,
  calculateNegativeMetrics,
  checkAllAntiAchievements,
  calculateEconomyMetrics,
};
