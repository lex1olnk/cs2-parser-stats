// services/database-service.ts
import { prisma } from "@/lib/prisma";
// Prisma 7 не реэкспортирует модели из "@prisma/client" — типы моделей
// берутся из сгенерированного клиента.
import { Prisma, PrismaClient, Weapon } from "@/../prisma/generated/client";

// Тип для транзакционного клиента Prisma
type PrismaTransactionalClient = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

export class DatabaseService {
  async saveParsedData(
    sessionId: string,
    matchUrl: string,
    tournamentId: string | null,
    parsedData: any
  ) {
    return await prisma.$transaction(async (tx) => {
      console.log("💾 Saving parsed data to database...");

      // 1. Создаем матч
      const match = await this.createMatch(
        tx,
        sessionId,
        matchUrl,
        tournamentId,
        parsedData.matchInfo
      );

      // 2. Создаем команды
      const teamsMap = await this.createTeams(tx, match.id, parsedData.teams);

      // 3. Сохраняем игроков и MatchMember (Users - upsert, MatchMembers - createMany)
      const playersMap = await this.processPlayers(
        tx,
        match.id,
        parsedData.players,
        teamsMap
      );

      // 4. Создаем карту матча
      const matchMap = await this.createMatchMap(
        tx,
        match.id,
        parsedData.matchInfo
      );

      // 5. Сохраняем раунды (Round - create, чтобы получить roundsMap)
      const roundsMap = await this.processRounds(
        tx,
        match.id,
        matchMap.id,
        parsedData.rounds,
        teamsMap
      );

      // 6. Сохраняем убийства (MatchKill - createMany)
      await this.processKills(
        tx,
        match.id,
        parsedData.kills,
        playersMap,
        roundsMap
      );

      // 7. Сохраняем урон (MatchDamage - createMany)
      await this.processDamages(
        tx,
        match.id,
        parsedData.damages,
        playersMap,
        roundsMap
      );

      // 8. Сохраняем гранаты (MatchGrenade - createMany)
      await this.processGrenades(
        tx,
        match.id,
        parsedData.grenades,
        playersMap,
        roundsMap
      );

      // 9. Сохраняем клочи (MatchClutch - createMany)
      await this.processClutches(
        tx,
        match.id,
        parsedData.clutches,
        playersMap,
        roundsMap
      );

      // 10. Сохраняем слепоту (MatchBlind - createMany)
      await this.processBlinds(
        tx,
        match.id,
        parsedData.blinds,
        playersMap,
        roundsMap
      );

      // 11. Сохраняем экономику и инвентарь (MatchPlayerEconomy - create, MatchInventory - createMany)
      await this.processEconomies(
        tx,
        match.id,
        parsedData.economies,
        playersMap,
        roundsMap
      );

      console.log("✅ All data saved to database successfully");
      return match.id;
    });
  }

  // -----------------------------------------------------------------
  // 💾 CRUD: Match, Team, Map (ОСТАВЛЕНЫ ИНДИВИДУАЛЬНЫЕ CREATE/UPSERT)
  // -----------------------------------------------------------------

  private async createMatch(
    tx: PrismaTransactionalClient,
    sessionId: string,
    matchUrl: string,
    tournamentId: string | null,
    matchInfo: any
  ) {
    return await tx.match.create({
      data: {
        type: "competitive",
        status: "finished",
        demoPath: matchUrl, // или можно сохранить оригинальный demoPath
        bestOf: 1,
        hasWinner: true,
        startedAt: new Date(),
        finishedAt: new Date(),
        tournamentId,
        maxRoundsCount: 30,
        serverInstanceId: "demo_parser",
        isFinal: false,
        createdAt: new Date(),
      },
    });
  }

  private async createTeams(
    tx: PrismaTransactionalClient,
    matchId: string,
    teams: any[]
  ) {
    const teamsMap = new Map();

    for (const teamData of teams) {
      const team = await tx.matchTeam.create({
        data: {
          name: teamData.name,
          size: teamData.players?.length || 0,
          score: 0,
          teamNum: teamData.teamNumber,
          isWinner: false,
          captainId: 1, // или определить капитана
          matchId: matchId,
        },
      });
      teamsMap.set(teamData.teamNumber, team.id);
    }

    return teamsMap;
  }

  private async createMatchMap(
    tx: PrismaTransactionalClient,
    matchId: string,
    matchInfo: any
  ) {
    let map = await tx.map.findFirst({
      where: { name: matchInfo.mapName },
    });

    if (!map) {
      map = await tx.map.create({
        data: {
          name: matchInfo.mapName,
          preview: `${matchInfo.mapName}_preview.jpg`,
          topview: `${matchInfo.mapName}_topview.jpg`,
        },
      });
    }

    return await tx.matchMap.create({
      data: {
        number: 1,
        mapId: map.id,
        startedAt: new Date(),
        finishedAt: new Date(),
        gameStatus: "finished",
        matchId: matchId,
      },
    });
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Players (User + MatchMember)
  // -----------------------------------------------------------------

  private async processPlayers(
    tx: PrismaTransactionalClient,
    matchId: string,
    players: any[],
    teamsMap: Map<any, any>
  ) {
    const playersMap = new Map();
    const membersData = [];

    for (const player of players) {
      // 1. Создаем/обновляем пользователя (upsert - индивидуально)
      const user = await tx.user.upsert({
        where: { steamId: player.steamId },
        update: { nickname: player.name },
        create: {
          nickname: player.name,
          steamId: player.steamId,
        },
      });

      playersMap.set(player.steamId, user.id);

      // 2. Собираем данные для создания участника матча
      const teamId = teamsMap.get(player.teamNumber);
      membersData.push({
        hash: `${matchId}_${user.id}`,
        role: "player",
        ready: true,
        connected: true,
        isLeaver: false,
        matchId: matchId,
        userId: user.id,
        matchTeamId: teamId,
      });
    }

    // 3. Пакетная вставка MatchMember
    if (membersData.length > 0) {
      await tx.matchMember.createMany({ data: membersData });
    }

    return playersMap;
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Rounds (ОСТАВЛЕН ИНДИВИДУАЛЬНЫЙ CREATE ДЛЯ roundsMap)
  // -----------------------------------------------------------------

  private async processRounds(
    tx: PrismaTransactionalClient,
    matchId: string,
    matchMapId: string,
    rounds: any[],
    teamsMap: Map<any, any>
  ) {
    const roundsMap = new Map();
    const roundsData = [];

    // Создаем по одному, чтобы получить ID для roundsMap
    for (const round of rounds) {
      const winMatchTeamId = teamsMap.get(round.winner === "T" ? 2 : 3);

      const roundRecord = await tx.round.create({
        data: {
          winReason: round.reason || "unknown",
          startedAt: new Date(Date.now() - round.roundNumber * 120000),
          finishedAt: new Date(),
          tick: round.tick || 0,
          winMatchTeamId: winMatchTeamId,
          winTeamNum: round.winner === "T" ? 2 : 3,
          matchId: matchId,
          matchMapId: matchMapId,
          roundNumber: round.roundNumber - 1,
          endReason: this.mapEndReason(round.reason),
        },
      });

      roundsMap.set(roundRecord.roundNumber, roundRecord.id);
    }

    return roundsMap;
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Kills (CREATE MANY)
  // -----------------------------------------------------------------

  private async processKills(
    tx: PrismaTransactionalClient,
    matchId: string,
    kills: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    const killsData = [];
    const weaponIdsCache = new Map<string, number>();

    for (const kill of kills) {
      const killerId = playersMap.get(kill.attackerSteamId);
      const victimId = playersMap.get(kill.victimSteamId);
      const assisterId = kill.assisterSteamId
        ? playersMap.get(kill.assisterSteamId)
        : undefined;
      const roundId = roundsMap.get(kill.round);

      if (!killerId || !victimId || !roundId) continue;

      let weaponId = weaponIdsCache.get(kill.weapon);
      if (!weaponId) {
        weaponId = await this.getOrCreateWeapon(tx, kill.weapon);
        weaponIdsCache.set(kill.weapon, weaponId);
      }

      // Примечание: isTeamKill требует DB-запроса, что замедляет цикл.
      // Это оставлено для функциональной корректности.
      const isTeamkill = await this.isTeamKill(tx, killerId, victimId, matchId);

      killsData.push({
        createdAt: new Date(),
        killerId: killerId,
        victimId: victimId,
        assistantId: assisterId,
        weaponId: weaponId,
        isHeadshot: kill.headshot || false,
        isWallbang: kill.wallbang || false,
        isAirshot: kill.airshot || false,
        isNoscope: kill.noscope || false,
        isTeamkill: isTeamkill,
        matchId: matchId,
        killerTeam: kill.attackerTeam,
        roundId: roundId,
        tick: kill.tick || 0,
        roundTime: kill.roundTime || 0,
        killerPositionX: kill.attackerX || 0,
        killerPositionY: kill.attackerY || 0,
        victimPositionX: kill.victimX || 0,
        victimPositionY: kill.victimY || 0,
        distance: kill.distance || 0,
        isThroughSmoke: kill.throughSmoke || false,
      });
    }

    if (killsData.length > 0) {
      await tx.matchKill.createMany({ data: killsData });
    }
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Damages (CREATE MANY)
  // -----------------------------------------------------------------

  private async processDamages(
    tx: PrismaTransactionalClient,
    matchId: string,
    damages: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    const damagesData = [];
    const weaponIdsCache = new Map<string, number>();

    for (const damage of damages) {
      const inflictorId = playersMap.get(damage.inflictorId);
      const victimId = playersMap.get(damage.victimId);
      const roundId = roundsMap.get(damage.round);

      if (!inflictorId || !victimId || !roundId) continue;

      let weaponId = weaponIdsCache.get(damage.weapon);
      if (!weaponId) {
        weaponId = await this.getOrCreateWeapon(tx, damage.weapon);
        weaponIdsCache.set(damage.weapon, weaponId);
      }

      damagesData.push({
        inflictorId,
        victimId,
        weaponId,
        inflictorTeam: damage.inflictorTeam,
        hitboxGroup: damage.hitboxGroup,
        hits: damage.hits,
        damageNormalized: damage.damageNormalized,
        damageReal: damage.damageReal,
        roundId,
        matchId: matchId,
      });
    }

    if (damagesData.length > 0) {
      await tx.matchDamage.createMany({ data: damagesData });
    }
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Grenades (CREATE MANY)
  // -----------------------------------------------------------------

  private async processGrenades(
    tx: PrismaTransactionalClient,
    matchId: string,
    grenades: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    const grenadesData = [];

    for (const grenade of grenades) {
      const userId = playersMap.get(grenade.userSteamId);
      const roundId = roundsMap.get(grenade.round);

      if (!userId || !roundId) continue;

      grenadesData.push({
        userId: userId,
        matchId: matchId,
        roundId: roundId,
        grenadeType: this.mapGrenadeType(grenade.type),
        detonatePositionX: grenade.x || 0,
        detonatePositionY: grenade.y || 0,
        detonatePositionZ: grenade.z || 0,
        entityId: grenade.entityId,
        tick: grenade.tick || 0,
        roundTime: 0,
      });
    }

    if (grenadesData.length > 0) {
      await tx.matchGrenade.createMany({ data: grenadesData });
    }
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Clutches (CREATE MANY)
  // -----------------------------------------------------------------

  private async processClutches(
    tx: PrismaTransactionalClient,
    matchId: string,
    clutches: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    const clutchesData = [];

    for (const clutch of clutches) {
      try {
        const userId = playersMap.get(clutch.steamId);
        const roundId = roundsMap.get(clutch.round - 1);

        if (!userId || !roundId) continue;

        clutchesData.push({
          userId: userId,
          matchId: matchId,
          roundId: roundId,
          success: clutch.success,
          amount: clutch.amount,
          createdAt: new Date(),
        });
      } catch (e) {
        // Ловим ошибку парсинга конкретного элемента, но продолжаем цикл
        console.error(e);
      }
    }

    if (clutchesData.length > 0) {
      await tx.matchClutch.createMany({
        data: clutchesData,
        // skipDuplicates: true // Можно добавить для обработки составных ключей, если данные не гарантируют уникальность
      });
    }
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Blinds (CREATE MANY)
  // -----------------------------------------------------------------

  private async processBlinds(
    tx: PrismaTransactionalClient,
    matchId: string,
    blinds: any[],
    playersMap: Map<any, any>,
    roundsMap: Map<any, any>
  ) {
    if (!blinds) return;

    const data = blinds
      .map((blind) => {
        const attackerId = playersMap.get(blind.attackerSteamId);
        const victimId = playersMap.get(blind.victimSteamId);
        const roundId = roundsMap.get(blind.round);

        if (!attackerId || !victimId || !roundId) return null;

        return {
          attackerId: attackerId,
          victimId: victimId,
          matchId: matchId,
          roundId: roundId,
          duration: blind.duration || 0,
          tick: blind.tick || 0,
        };
      })
      .filter((b) => b !== null);

    if (data.length > 0) {
      await tx.matchBlind.createMany({ data });
    }
  }

  // -----------------------------------------------------------------
  // 🚀 CRUD: Economies & Inventories (CREATE / CREATE MANY)
  // -----------------------------------------------------------------

  /**
   * Обрабатывает данные об экономике (MatchPlayerEconomy) и инвентаре (MatchInventory)
   * для каждого игрока в каждом раунде. Использует Promise.all для параллельного выполнения
   * операций и повышения производительности.
   * * @param tx Транзакционный клиент Prisma.
   * @param matchId ID матча.
   * @param economies Массив данных об экономике (из parseRoundStartEquipment).
   * @param playersMap Карта {SteamId: UserId}.
   * @param roundsMap Карта {RoundNumber: RoundId}.
   */
  private async processEconomies(
    tx: PrismaTransactionalClient,
    matchId: string,
    economies: {
      roundNumber: number;
      players: {
        steamId: string;
        teamNum: number;
        moneyStart: number;
        inventory: String[];
        tick: number;
      }[];
    }[],
    playersMap: Map<string, number>, // Предполагаем string
    roundsMap: Map<number, string> // Предполагаем number -> string
  ): Promise<void> {
    if (!economies || economies.length === 0) return;
    const weapons = await tx.weapon.findMany({});
    // 1. Создаем массив промисов для параллельного выполнения операций
    const economyPromises = economies.flatMap((roundEco) => {
      // roundEco.players — это массив игроков для данного раунда
      if (!roundEco.players || !Array.isArray(roundEco.players)) return [];

      const roundId = roundsMap.get(roundEco.roundNumber);

      // Итерируем по каждому игроку в раунде
      return roundEco.players.map((playerEco) => {
        const userId = playersMap.get(playerEco.steamId);
        const teamId = playerEco.teamNum;

        if (!userId || !roundId) {
          // Возвращаем разрешенный промис, чтобы не сломать Promise.all
          return Promise.resolve();
        }

        // Создаем промис для ОДНОЙ цепочки:
        // 1. Создание Economy Record
        // 2. Создание Inventory Records
        return (async () => {
          // 1. Создаем запись MatchPlayerEconomy (родительская запись)
          // ОПЕРАЦИЯ: CREATE
          const economyRecord = await tx.matchPlayerEconomy.create({
            data: {
              userId: userId,
              matchId: matchId,
              roundId: roundId,
              startMoney: playerEco.moneyStart || 0, // moneyStart из исправленного парсера
              teamNum: teamId,
              tick: playerEco.tick || 0,
            },
          });

          // 2. Создаем записи MatchInventory (дочерние записи)
          // ОПЕРАЦИЯ: CREATEMANY (предполагаем, что processInventories использует createMany)
          if (playerEco.inventory && Array.isArray(playerEco.inventory)) {
            await this.processInventories(
              tx,
              userId,
              roundId,
              economyRecord.id, // ID созданной записи экономики
              playerEco.inventory,
              weapons
            );
          }
        })(); // Самовызывающаяся асинхронная функция
      });
    });

    // 2. Выполняем все операции параллельно
    await Promise.all(economyPromises);
  }

  private async processInventories(
    tx: PrismaTransactionalClient,
    userId: number,
    roundId: string,
    economySnapshotId: string,
    inventoryData: any[],
    weapons: Weapon[]
  ) {
    const inventoryItems = [];
    const weaponIdsCache = new Map<string, number>();

    weapons.map((w) => {
      weaponIdsCache.set(w.inventoryName, w.id);
    });
    //console.log(weaponIdsCache, inventoryData);
    for (const item of inventoryData) {
      let weaponId = weaponIdsCache.get(item);
      if (!weaponId) {
        weaponId = 0;
      }

      inventoryItems.push({
        userId: userId,
        roundId: roundId,
        weaponId: weaponId,
        economySnapshotId: economySnapshotId, // Ссылка на родительскую запись
      });
    }

    if (inventoryItems.length > 0) {
      // Пакетная вставка инвентаря
      await tx.matchInventory.createMany({
        data: inventoryItems,
      });
    }
  }

  // -----------------------------------------------------------------
  // ⚙️ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ (Оставлены без изменений)
  // -----------------------------------------------------------------

  private async getOrCreateWeapon(
    tx: PrismaTransactionalClient,
    weaponName: string
  ): Promise<number> {
    if (
      !weaponName ||
      weaponName.trim() === "" ||
      weaponName === "undefined" ||
      weaponName === "null"
    ) {
      return 0;
    }
    try {
      // Сначала пытаемся найти существующее оружие
      const existing = await tx.weapon.findUnique({
        where: { name: weaponName },
        select: { id: true },
      });

      if (existing) {
        return existing.id;
      }

      // Если не найдено - создаем новое
      try {
        const weapon = await tx.weapon.create({
          data: {
            name: weaponName,
            internalName: weaponName,
            inventoryName: weaponName,
            cost: 0,
            // Без типа не работает фильтрация статистики по категориям
            // (например, урон гранатами в /api/stats/stats).
            type: this.mapWeaponType(weaponName),
          },
        });
        return weapon.id;
      } catch (createError) {
        // Обработка редкого случая конкурентного создания
        if (
          createError instanceof Prisma.PrismaClientKnownRequestError &&
          createError.code === "P2002"
        ) {
          // Кто-то другой уже создал запись
          const existing = await tx.weapon.findUnique({
            where: { name: weaponName },
            select: { id: true },
          });
          if (existing) {
            return existing.id;
          }
        }
        throw createError;
      }
    } catch (error) {
      console.error(`Error in getOrCreateWeapon for "${weaponName}":`, error);
      throw error; // Пробрасываем ошибку выше для обработки в вызывающем коде
    }
  }

  private async isTeamKill(
    tx: PrismaTransactionalClient,
    attackerId: number,
    victimId: number,
    matchId: string
  ): Promise<boolean> {
    try {
      const attacker = await tx.matchMember.findFirst({
        where: { userId: attackerId, matchId },
      });
      const victim = await tx.matchMember.findFirst({
        where: { userId: victimId, matchId },
      });
      return attacker?.matchTeamId === victim?.matchTeamId;
    } catch {
      return false;
    }
  }

  private mapGrenadeType(type: string): number {
    const grenadeMap: { [key: string]: number } = {
      smokegrenade: 0,
      flashbang: 1,
      hegrenade: 2,
      molotov: 3,
      decoy: 4,
    };
    return grenadeMap[type] || 0;
  }

  private mapEndReason(reason?: string): number {
    const reasonMap: { [key: string]: number } = {
      bomb_exploded: 1,
      bomb_defused: 2,
      t_killed: 3,
      ct_killed: 4,
    };
    return reasonMap[reason || ""] || 0;
  }

  // Парсер отдаёт внутренние имена CS2 (ak47, deagle, hegrenade), а не
  // человекочитаемые названия — поэтому сопоставление по списку, а не по
  // подстрокам вроде "rifle": таких слов в этих именах нет.
  // Категории должны совпадать с бэкфиллом в миграции
  // 20260909020000_kill_trades_and_weapon_types.
  private static readonly WEAPON_TYPES: Record<string, string> = {
    hegrenade: "grenade",
    flashbang: "grenade",
    smokegrenade: "grenade",
    molotov: "grenade",
    incgrenade: "grenade",
    inferno: "grenade",
    decoy: "grenade",

    knife: "melee",
    knife_t: "melee",
    bayonet: "melee",

    deagle: "pistol",
    elite: "pistol",
    fiveseven: "pistol",
    glock: "pistol",
    hkp2000: "pistol",
    p250: "pistol",
    revolver: "pistol",
    tec9: "pistol",
    usp_silencer: "pistol",
    cz75a: "pistol",

    bizon: "smg",
    mac10: "smg",
    mp5sd: "smg",
    mp7: "smg",
    mp9: "smg",
    p90: "smg",
    ump45: "smg",

    ak47: "rifle",
    aug: "rifle",
    famas: "rifle",
    galilar: "rifle",
    m4a1: "rifle",
    m4a1_silencer: "rifle",
    sg556: "rifle",

    awp: "sniper",
    ssg08: "sniper",
    scar20: "sniper",
    g3sg1: "sniper",

    mag7: "shotgun",
    nova: "shotgun",
    sawedoff: "shotgun",
    xm1014: "shotgun",

    m249: "machinegun",
    negev: "machinegun",

    kevlar: "equipment",
    kevlar_helmet: "equipment",
    defuse: "equipment",
    taser: "equipment",
  };

  private mapWeaponType(weaponName?: string): string {
    if (!weaponName) return "other";

    return DatabaseService.WEAPON_TYPES[weaponName.toLowerCase()] ?? "other";
  }
}

export const databaseService = new DatabaseService();
