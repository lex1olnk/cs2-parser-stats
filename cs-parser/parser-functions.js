// demo-server/parser-functions.js
const demoparser = require("@laihoe/demoparser2");

// Основная функция парсинга всех данных
function parseAllData(demoPath) {
  console.log(`🔄 Starting full demo parsing: ${demoPath}`);

  try {
    const matchInfo = parseMatchInfo(demoPath);
    const players = parsePlayersInfo(demoPath);
    const rounds = parseRoundsInfo(demoPath);
    const kills = parseKillsInfo(demoPath);
    const damages = parseDamagesInfo(demoPath, players);
    const grenades = parseGrenadesInfo(demoPath);
    const clutches = parseClutches(demoPath, rounds, kills);
    const teams = parseTeamsInfo(players);

    const economies = parseRoundStartEquipment(demoPath);
    const blinds = parseBlindEvents(demoPath);

    console.log(`✅ Demo parsing completed successfully`);

    return {
      matchInfo,
      players,
      rounds,
      kills,
      damages,
      grenades,
      clutches,
      teams,
      economies,
      blinds,
    };
  } catch (error) {
    console.error(`❌ Demo parsing failed: ${error.message}`);
    throw error;
  }
}

// 1. Информация о матче
function parseMatchInfo(demoPath) {
  console.log("📊 Parsing match info...");

  const matchStart = demoparser.parseEvent(demoPath, "match_start", [
    "map_name",
  ]);
  const firstMatch = matchStart[0] || {};

  return {
    mapName: firstMatch.map_name || "de_dust2",
    demoPath: demoPath,
    type: "competitive",
    status: "finished",
  };
}

// 2. Информация об игроках
function parsePlayersInfo(demoPath) {
  console.log("👥 Parsing players...");

  const playerInfo = demoparser.parsePlayerInfo(demoPath);
  return playerInfo
    .map((player) => ({
      steamId: player.steamid,
      name: player.name,
      teamNumber: player.team_number,
    }))
    .filter((player) => player.steamId); // фильтруем игроков без steamId
}

// 3. Раунды
function parseRoundsInfo(demoPath) {
  console.log("🔄 Parsing rounds...");

  const roundEnds = demoparser.parseEvent(
    demoPath,
    "round_end",
    ["winner", "reason", "round_num", "mvps"],
    ["round_start_time", "game_phase", "tick", "total_rounds_played"]
  );
  // Берем только последнее событие для каждого total_rounds_played
  const uniqueRounds = Object.values(
    roundEnds.reduce((acc, round) => {
      const key = round.total_rounds_played;
      if (!acc[key] || round.tick > acc[key].tick) {
        acc[key] = round;
      }
      return acc;
    }, {})
  );

  return uniqueRounds
    .map((round) => ({
      roundNumber: round.total_rounds_played,
      winner: round.winner,
      reason: round.reason,
      tick: round.tick,
      roundStartTime: round.round_start_time,
      gamePhase: round.game_phase,
    }))
    .filter((f) => f.roundNumber > 0);
}

// 4. Убийства
function parseKillsInfo(demoPath) {
  console.log("🔫 Parsing kills...");

  const kills = demoparser.parseEvent(
    demoPath,
    "player_death",
    ["X", "Y", "Z", "team_num"],
    ["total_rounds_played", "round_start_time", "game_phase"]
  );
  const zeroRounds = kills.filter((item) => item.total_rounds_played === 0);
  const nonZeroRounds = kills.filter((item) => item.total_rounds_played > 0);

  const maxRoundTime = Math.max(
    ...zeroRounds.map((item) => item.round_start_time)
  );
  const maxTimeZeroRounds = zeroRounds.filter(
    (item) => item.round_start_time === maxRoundTime
  );

  const data = [...maxTimeZeroRounds, ...nonZeroRounds];

  return data
    .filter((kill) => kill.game_phase !== 5)
    .map((kill) => ({
      attackerSteamId: kill.attacker_steamid,
      victimSteamId: kill.user_steamid,
      assisterSteamId: kill.assister_steamid,
      attackerTeam: kill.attacker_team_num,
      weapon: kill.weapon,
      headshot: kill.headshot || false,
      wallbang: kill.penetrated ? kill.penetrated > 0 : false,
      airshot: kill.attackerinair || false,
      noscope: kill.noscope || false,
      round: kill.total_rounds_played,
      victimTeamNum: kill.user_team_num,
      tick: kill.tick,
      roundTime: kill.round_start_time || 0,
      attackerX: kill.attacker_X || 0,
      attackerY: kill.attacker_Y || 0,
      attackerY: kill.attacker_Z || 0,
      victimX: kill.user_X || 0,
      victimY: kill.user_Y || 0,
      victimZ: kill.user_Z || 0,
      distance: kill.distance || 0,
      throughSmoke: kill.thrusmoke || false,
      hitgroup: kill.hitgroup,
    }));
}

function parsePurchasesInfo(demoPath) {
  console.log("🛒 Parsing item_purchase events...");
  try {
    const purchases = parseEvent(
      demoPath,
      "item_purchase",
      ["user_steamid", "weapon", "team_num", "player_money"],
      ["total_rounds_played"]
    );
    //console.log(purchases);
    return purchases.map((p) => ({
      steamId: p.steamid,
      itemName: p.item_name, // Flashbang, AK-47, HE Grenade
      cost: p.cost, // Цена покупки
      team: p.user_team_num, // Команда, совершившая покупку
      round: p.total_rounds_played,
      tick: p.tick,
      wasSold: p.was_sold, // Была ли продана (обычно false для покупки)
    }));
  } catch (e) {
    console.error("Failed to parse item_purchase:", e.message);
    return [];
  }
}

// 5. Урон
function parseDamagesInfo(demoPath) {
  console.log("💥 Parsing damages...");

  const damages = demoparser.parseEvent(
    demoPath,
    "player_hurt",
    ["team_num"],
    ["total_rounds_played", "round_start_time", "game_phase"]
  );
  // Остальной код без изменений...
  const zeroRounds = damages.filter((item) => item.total_rounds_played === 0);
  const nonZeroRounds = damages.filter((item) => item.total_rounds_played > 0);

  const maxRoundTime = Math.max(
    ...zeroRounds.map((item) => item.round_start_time)
  );
  const maxTimeZeroRounds = zeroRounds.filter(
    (item) => item.round_start_time === maxRoundTime
  );

  const data = [...maxTimeZeroRounds, ...nonZeroRounds];

  const playerInfo = demoparser.parsePlayerInfo(demoPath); // Используем this.parsePlayerInfo
  const playerHealth = new Map();

  playerInfo.forEach((p) => {
    if (p.steamid) {
      playerHealth.set(p.steamid, { health: 100, currentRound: 0 });
    }
  });

  const aggregatedMap = new Map();
  for (const d of data) {
    if (d.game_phase === 5) break;

    const virtualRound = d.total_rounds_played;
    const victimState = playerHealth.get(d.user_steamid) || {
      health: 100,
      currentRound: virtualRound,
    };

    if (victimState.currentRound !== virtualRound) {
      victimState.health = 100;
      victimState.currentRound = virtualRound;
    }

    const currentVictimHealth = victimState.health;
    const normalizedDamage = Math.min(d.dmg_health, currentVictimHealth);
    victimState.health = d.health;
    playerHealth.set(d.user_steamid, victimState);

    const key = `${d.attacker_steamid}-${d.user_steamid}-${d.weapon}-${d.hitgroup}-${d.total_rounds_played}`;
    if (aggregatedMap.get(key) == null) {
      aggregatedMap.set(key, {
        damageReal: 0,
        damageNormalized: 0,
        hitboxGroup: d.hitgroup,
        hits: 0,
        inflictorId: d.attacker_steamid,
        victimId: d.user_steamid,
        weapon: d.weapon,
        round: d.total_rounds_played,
        inflictorTeam: d.attacker_team_num,
      });
    }

    const entry = aggregatedMap.get(key);
    entry.hits += 1;
    entry.damageReal += d.dmg_health;
    entry.damageNormalized += normalizedDamage;
  }

  return Array.from(aggregatedMap.values()).map((damage) => ({
    ...damage,
  }));
}

// 6. Гранаты
function parseGrenadesInfo(demoPath) {
  console.log("💣 Parsing grenades...");

  const grenadeEvents = [
    { event: "flashbang_detonate", type: "flashbang" },
    { event: "hegrenade_detonate", type: "hegrenade" },
    { event: "smokegrenade_detonate", type: "smokegrenade" },
    { event: "inferno_startburn", type: "molotov" },
    { event: "decoy_detonate", type: "decoy" },
  ];

  const allGrenades = [];
  const processedEntities = new Set();

  grenadeEvents.forEach((grenadeEvent) => {
    const grenades = demoparser.parseEvent(
      demoPath,
      grenadeEvent.event,
      ["user_steamid", "x", "y", "z", "tick", "entityid"],
      ["total_rounds_played"]
    );

    grenades.forEach((grenade) => {
      if (grenade.entityid && processedEntities.has(grenade.entityid)) {
        return;
      }

      allGrenades.push({
        userSteamId: grenade.user_steamid,
        type: grenadeEvent.type,
        x: grenade.x || 0,
        y: grenade.y || 0,
        z: grenade.z || 0,
        tick: grenade.tick,
        round: grenade.total_rounds_played,
        entityId: grenade.entityid || null,
      });

      if (grenade.entityid) {
        processedEntities.add(grenade.entityid);
      }
    });
  });

  return allGrenades;
}

// 7. Команды (на основе игроков)
function parseTeamsInfo(players) {
  console.log("🏆 Parsing teams...");

  const teams = {};

  players.forEach((player) => {
    if (player.teamNumber) {
      if (!teams[player.teamNumber]) {
        teams[player.teamNumber] = {
          teamNumber: player.teamNumber,
          name: `Team ${player.teamNumber === 2 ? "A" : "B"}`,
          players: [],
        };
      }
      teams[player.teamNumber].players.push(player.steamId);
    }
  });

  return Object.values(teams);
}

const getSideNumber = (ch) => (ch === "CT" ? 3 : 2);

function parseClutches(demoPath, rounds, kills) {
  const myrounds = rounds.map((r) => r);
  if (!rounds && !kills) return [];
  console.log("💣 Parsing clutches...");
  const grp = Object.groupBy(kills, (k) => k.round);

  Object.values(grp).map((k, index) => {
    myrounds[index].kills = k;
  });

  let result = [];

  myrounds.map((r) => {
    result = [...result, ...findClutchOld(demoPath, r)];
  });

  return result;
}

function findClutchOld(demoPath, round) {
  try {
    const playersState = {};
    const clutchSituations = [];
    let teams = { 2: 5, 3: 5 };

    demoparser.parseTicks(demoPath, ["team_num"], [round.tick]).map((p) => {
      if (playersState[p.steamid] === undefined) playersState[p.steamid] = p;
      playersState[p.steamid].isAlive = true;
    });

    let against = 0;
    let last = 1;
    let enemy = 1;

    for (const kill of round.kills) {
      playersState[kill.victimSteamId].isAlive = false;
      teams[kill.victimTeamNum]--;

      if (teams[2] === 1 || teams[3] === 1) {
        last = teams[2] === 1 ? 2 : 3;
        enemy = last === 2 ? 3 : 2;
        against = teams[enemy];
        break;
      }
    }

    const lastPlayer = Object.keys(playersState).find(
      (key) =>
        (playersState[key].isAlive === true) &
        (playersState[key].team_num === last)
    );

    if (lastPlayer) {
      const isSuccess = getSideNumber(round.winner) === last;

      clutchSituations.push({
        teamNum: last,
        steamId: lastPlayer,
        amount: against,
        success: isSuccess,
        winner: round.winner,
        round: round.roundNumber,
      });
    }

    for (let i = 0; i < 8 && i < round.kills.length; i++) {
      playersState[round.kills[i].victimSteamId].isAlive = false;
    }
    // Дополнительный клатч при 9+ убийствах
    if (round.kills.length > 8) {
      const isEnemyWinner = getSideNumber(round.winner) === enemy;

      // Находим последнего выжившего из противоположной команды
      const lastSurvivingEnemy = Object.keys(playersState).find(
        (key) =>
          playersState[key].isAlive === true &&
          playersState[key].team_num === enemy
      );

      let clutchPlayerSteamId = lastPlayer + "-1";

      // Если нашли игрока, создаем клатч-ситуацию
      if (clutchPlayerSteamId) {
        clutchSituations.push({
          teamNum: enemy,
          steamId: lastSurvivingEnemy,
          amount: 1,
          success: isEnemyWinner,
          winner: round.winner,
          round: round.roundNumber,
        });
      }
    }

    return clutchSituations;
  } catch (err) {
    console.log(err);
  }
}

// 5. Покупки (НОВАЯ ФУНКЦИЯ/КОРРЕКТИРОВКА)
function parseRoundStartEquipment(demoPath) {
  console.log("🛡️ Parsing round-start equipment, filtering Knife Round...");

  // 1. Получаем все события round_start
  const roundStartEvents = demoparser.parseEvent(demoPath, "round_start", [
    "total_rounds_played",
    "tick",
    "round_start_time",
  ]);

  // --- ЛОГИКА ФИЛЬТРАЦИИ НОЖЕВОГО РАУНДА ---
  const zeroRounds = roundStartEvents.filter(
    (item) => item.total_rounds_played === 0
  );

  // Находим тик самого ПОЗДНЕГО события round_start с total_rounds_played = 0.
  // Это будет Пистолетный раунд (Раунд 1), а не Ножевой.
  const lastTickForZero = Math.max(...zeroRounds.map((item) => item.tick));

  // Фильтруем все события, исключая самое раннее с total_rounds_played=0 (ножевой)
  // и оставляя только последнее с total_rounds_played=0 (пистолетный) и все остальные.
  const filteredRoundStarts = roundStartEvents.filter((event) => {
    // Если total_rounds_played > 0, оставляем
    if (event.total_rounds_played > 0) return true;

    // Если total_rounds_played == 0, оставляем только то, у которого максимальный тик
    return event.tick === lastTickForZero;
  });
  // ------------------------------------------

  const FREEZE_TICKS = 15 * 128;
  const equipmentByRound = {};

  filteredRoundStarts.forEach((event) => {
    // !!! ИСПРАВЛЕНИЕ СМЕЩЕНИЯ:
    const actualRoundNumber = event.total_rounds_played + 1;

    if (actualRoundNumber < 1) return;

    const equipmentCheckTick = event.tick + FREEZE_TICKS + 2;

    // 1. Получаем состояние игроков в нужный тик
    const equipmentTicks = demoparser.parseTicks(
      demoPath,
      ["steamid", "team_num", "balance", "inventory"],
      [equipmentCheckTick]
    );

    const playersEquipment = [];

    equipmentTicks.forEach((tickData) => {
      if (tickData.team_num !== 2 && tickData.team_num !== 3) return;

      // 2. Формируем объект данных игрока
      playersEquipment.push({
        roundNumber: actualRoundNumber,
        steamId: tickData.steamid,
        teamNum: tickData.team_num,
        moneyStart: tickData.balance,
        inventory: tickData.inventory || [],
        tick: tickData.tick,
      });
    });

    // 3. Сохраняем данные для текущего раунда
    equipmentByRound[actualRoundNumber] = {
      roundNumber: actualRoundNumber,
      players: playersEquipment,
    };
  });

  const parsedData = Object.values(equipmentByRound);

  console.log(
    `✅ Parsed equipment for ${parsedData.length} rounds (Filtered Knife Round)`
  );

  return parsedData;
}

// 6. Ослепления (НОВАЯ ФУНКЦИЯ)
function parseBlindEvents(demoPath) {
  console.log("👁️ Parsing player_blind events...");
  try {
    const blindEvents = demoparser.parseEvent(
      demoPath,
      "player_blind",
      [
        "user_steamid",
        "entity_id",
        "blind_duration",
        "attacker_steamid", // Добавляем attacker
      ],
      ["total_rounds_played", "tick", "round_start_time"] // Добавляем tick и round_start_time для очистки
    );

    return blindEvents.map((b) => ({
      steamId: b.user_steamid, // Ослепленный
      attackerSteamId: b.attacker_steamid, // Флешер
      duration: b.blind_duration,
      round: b.total_rounds_played,
      tick: b.tick,
      round_start_time: b.round_start_time || 0, // Важно для cleanFastcupZeroRounds
    }));
  } catch (e) {
    console.error("Failed to parse player_blind:", e.message);
    return [];
  }
}

// Функции для маппинга (как в твоем классе)
function mapGrenadeType(type) {
  const grenadeMap = {
    smokegrenade: 0,
    flashbang: 1,
    hegrenade: 2,
    molotov: 3,
    decoy: 4,
  };
  return grenadeMap[type] || 0;
}

function mapEndReason(reason) {
  const reasonMap = {
    bomb_exploded: 1,
    bomb_defused: 2,
    t_killed: 3,
    ct_killed: 4,
  };
  return reasonMap[reason || ""] || 0;
}

function mapWeaponType(weaponName) {
  if (!weaponName) return "Other";
  if (weaponName.includes("knife")) return "Melee";
  if (weaponName.includes("pistol")) return "Pistol";
  if (weaponName.includes("rifle")) return "Rifle";
  if (weaponName.includes("smg")) return "SMG";
  if (weaponName.includes("shotgun")) return "Shotgun";
  if (weaponName.includes("sniper")) return "Sniper";
  return "Other";
}

module.exports = {
  parseAllData,
  parseMatchInfo,
  parsePlayersInfo,
  parseRoundsInfo,
  parseKillsInfo,
  parseDamagesInfo,
  parseGrenadesInfo,
  parseTeamsInfo,
  mapGrenadeType,
  mapEndReason,
  mapWeaponType,
};
