/**
 * Контракт данных, которые cs-parser отдаёт в `/api/parse/callback`.
 *
 * Источник — `parseAllData` в `cs-parser/parser-functions.js`. Формы сняты
 * с реального разбора демки, а не выведены из кода: поля, которых в выводе
 * нет, здесь не описаны, а необязательными помечено то, что появилось
 * позже и может отсутствовать в данных от старой версии парсера.
 *
 * Данные приходят по сети из другого сервиса, поэтому строковые поля,
 * которые парсер берёт из демки (`winner`, `reason`, `weapon`, `type`),
 * намеренно оставлены `string`: сузить их до объединений — значит соврать
 * о том, что мы контролируем эти значения.
 */

/** Стабильная метка команды внутри матча. Стороны меняются, метка — нет. */
export type TeamLabel = "A" | "B";

export interface ParsedMatchInfo {
  /** Из заголовка демки; "unknown", если определить не удалось. */
  mapName: string;
  demoPath: string;
  type: string;
  status: string;
}

export interface ParsedPlayer {
  steamId: string;
  name: string;
  /**
   * Сторона из `parsePlayerInfo` на один фиксированный момент демки.
   * Для определения команды НЕ годится — стороны меняются в перерыве;
   * используйте `teamLabel`.
   */
  teamNumber: number;
  /** Появился вместе с `assignTeamsByRoundSides`. */
  teamLabel?: TeamLabel | null;
  /** Сторона команды в первом раунде: 2 = T, 3 = CT. */
  startSide?: number | null;
}

export interface ParsedRound {
  /** Номер раунда от `round_end`: `total_rounds_played`. */
  roundNumber: number;
  /** Сторона-победитель: "T" или "CT". */
  winner: string;
  reason: string;
  tick: number;
  roundStartTime: number;
  gamePhase: number;
  /** Команда-победитель с учётом смены сторон. */
  winnerTeamLabel?: TeamLabel | null;
}

export interface ParsedTeam {
  label?: TeamLabel;
  name: string;
  /** Сторона в первом раунде. */
  startSide?: number | null;
  /** То же, что `startSide`; оставлено для обратной совместимости. */
  teamNumber?: number | null;
  /** steamId состава. */
  players?: string[];
  /** Счёт по выигранным раундам. */
  score?: number;
  isWinner?: boolean;
}

export interface ParsedKill {
  attackerSteamId: string | null;
  victimSteamId: string;
  assisterSteamId: string | null;
  /** Ассист за флешку, а не за урон. */
  assistedFlash?: boolean;
  attackerTeam: number | null;
  victimTeamNum: number;
  weapon: string;
  headshot: boolean;
  wallbang: boolean;
  airshot: boolean;
  noscope: boolean;
  throughSmoke: boolean;
  hitgroup: string;
  distance: number;
  /** Номер раунда от события: сыграно раундов ДО текущего. */
  round: number;
  roundTime: number;
  tick: number;
  attackerX: number;
  attackerY: number;
  victimX: number;
  victimY: number;
  victimZ: number;
  /** Насколько убийство подвинуло шанс команды убийцы выиграть раунд. */
  swing?: number;
  /** Команда убийцы всё равно почти наверняка проигрывала. */
  isExitFrag?: boolean;
  /** Раунд уже был решён: бомба разминирована или взорвалась. */
  isDeadRubber?: boolean;
  /** Расклад перед убийством, например "1v4". */
  aliveBefore?: string;
}

/** События бомбы: без них не посчитать шанс на победу. */
export interface ParsedBombEvent {
  kind: "planted" | "defused" | "exploded";
  steamId: string | null;
  site: number | null;
  round: number;
  tick: number;
}

/** Сводка вклада игрока в исход раундов. */
export interface ParsedSwing {
  steamId: string;
  swing: number;
  swingGained: number;
  swingLost: number;
  exitFrags: number;
  deadRubberFrags: number;
  impactFrags: number;
}

export interface ParsedDamage {
  /** steamId, несмотря на имя поля. */
  inflictorId: string | null;
  /** steamId, несмотря на имя поля. */
  victimId: string;
  inflictorTeam: number | null;
  weapon: string;
  hitboxGroup: string;
  /** Урон, обрезанный оставшимся здоровьем жертвы. */
  damageNormalized: number;
  damageReal: number;
  hits: number;
  round: number;
}

export interface ParsedGrenade {
  userSteamId: string;
  type: string;
  x: number;
  y: number;
  z: number;
  tick: number;
  round: number;
  entityId: number;
}

export interface ParsedClutch {
  steamId: string;
  teamNum: number;
  /** Сколько соперников оставалось: 1..5. */
  amount: number;
  success: boolean;
  winner: string;
  round: number;
}

export interface ParsedBlind {
  /** Ослеплённый игрок. */
  steamId: string;
  /** Кто бросил флешку. */
  attackerSteamId: string | null;
  duration: number;
  round: number;
  tick: number;
  /**
   * Поля с таким именем `parseBlindEvents` не отдаёт — оно есть только
   * у убийств. Оставлено на случай данных от стороннего парсера.
   */
  victimSteamId?: string;
}

export interface ParsedEconomyPlayer {
  roundNumber: number;
  steamId: string;
  teamNum: number;
  /** Деньги на конце freeze time, то есть уже после закупки. */
  moneyStart: number;
  inventory: string[];
  tick: number;
}

export interface ParsedRoundEconomy {
  /** Номер раунда от `round_start`: сыграно раундов ДО текущего, плюс один. */
  roundNumber: number;
  players: ParsedEconomyPlayer[];
}

/** Полный результат `parseAllData`. */
export interface ParsedDemo {
  matchInfo: ParsedMatchInfo;
  players: ParsedPlayer[];
  rounds: ParsedRound[];
  teams: ParsedTeam[];
  kills: ParsedKill[];
  damages: ParsedDamage[];
  grenades: ParsedGrenade[];
  clutches: ParsedClutch[];
  economies: ParsedRoundEconomy[];
  blinds: ParsedBlind[];
  bombEvents?: ParsedBombEvent[];
  swing?: ParsedSwing[];
}
