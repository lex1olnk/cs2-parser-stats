"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

//import { getRatingColor } from "@/lib/utils"

import { getRatingColor } from "@/lib/utils";
import { DataTableControls } from "./DataTableControls";
import "./style.css";

const picks = ["pick1.svg", "pick2.svg", "pick3.svg", "pick4.svg", "pick5.svg"];

const colors = [
  { rank: "?", color: "#AAAAAA" },
  { rank: "SSS", color: "#881616" },
  { rank: "SS", color: "#C73A3A" },
  { rank: "S", color: "#E5992D" },
  { rank: "A", color: "#E3E35D" },
  { rank: "B", color: "#6AE87D" },
  { rank: "C", color: "#4BEDC7" },
];

const ratingTier = (uLRating: number) => {
  if (uLRating == 0) {
    return colors[0];
  }
  if (uLRating >= 90) {
    return colors[1];
  }
  if (uLRating >= 85) {
    return colors[2];
  }
  if (uLRating >= 80) {
    return colors[3];
  }
  if (uLRating >= 70) {
    return colors[4];
  }
  if (uLRating >= 60) {
    return colors[5];
  }
  return colors[6];
};

interface PlayerStats {
  playerID: number;
  nickname: string;
  uLRating: number;
  pick_number: number;
  img: string;
  matches: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  kast: number;
  damage: number;
  exchanged: number;
  firstDeaths: number;
  firstKills: number;
  multiKills: number[];
  clutches: number[];
  rounds: number;
  teamID: number;
  ul_id: string | null;
  kpr: number;
  dpr: number;
  impact: number;
  clutchExp: number;
  rating: number;
  matchID: number;
  is_winner: boolean;
  date: string;
}

type SortableColumn =
  | "K"
  | "D"
  | "A"
  | "K/D"
  | "+/-"
  | "HS%"
  | "ADR"
  | "FK"
  | "FD"
  | "CExp"
  | "KAST"
  | "IMP"
  | "Maps"
  | "KPR"
  | "DPR"
  | "Rating";

type SortDirection = "asc" | "desc" | null;

interface FilterState {
  sortColumn: SortableColumn | null;
  sortDirection: SortDirection;
}

interface RangeState {
  ratingRange: [number, number];
}

// Добавим маппинг столбцов на поля данных
const columnMapping: Record<
  SortableColumn,
  keyof PlayerStats | ((player: PlayerStats) => number)
> = {
  K: "kills",
  D: "deaths",
  A: "assists",
  "K/D": (player) => player.kills / player.deaths,
  "+/-": (player) => player.kills - player.deaths,
  ADR: (player) => player.damage / player.rounds,
  "HS%": (player) => player.headshots || 0,
  FK: "firstKills",
  FD: "firstDeaths",
  CExp: "clutchExp",
  KAST: (player) => player.kast,
  IMP: (player) => player.impact,
  Maps: "matches",
  KPR: (player) => player.kills / player.rounds,
  DPR: (player) => player.deaths / player.rounds,
  Rating: (player) => player.rating,
};

interface Tournament {
  id: string;
  name: string;
}

export default function PlayersTable(props: {
  players: PlayerStats[];
  ulTournaments: Tournament[];
}) {
  const { players, ulTournaments } = props;
  const [selectedPicks, setSelectedPicks] = useState<number[]>([]);
  const [showBestByPicks, setShowBestByPicks] = useState(false);
  const [showWinners, setShowWinners] = useState(false);
  const [ulTournament, setUlTournament] = useState<string>("");

  const extractNumber = (name: string) => {
    const numbers = name.match(/\d+/g); // Находим все числа в строке
    return numbers ? parseInt(numbers[0]) : 0; // Берем первое число
  };

  const sortedTournaments = ulTournaments.sort((a, b) => {
    const numA = extractNumber(a.name);
    const numB = extractNumber(b.name);
    return numB - numA; // Сортировка по убыванию
  });

  const [filters, setFilters] = useState<FilterState>({
    sortColumn: null,
    sortDirection: null,
  });
  const [range, setRange] = useState<RangeState>({
    ratingRange: [0, 100],
  });

  const [matchesFilter, setMatchesFilter] = useState<"all" | "enough" | "low">(
    "all"
  );
  const filteredData = useMemo(() => {
    let result = players.filter(
      (player) =>
        player.uLRating >= range.ratingRange[0] &&
        player.uLRating <= range.ratingRange[1] &&
        player.ul_id == ulTournament
    );

    // Фильтрация по выбранным пикам
    if (selectedPicks.length > 0) {
      result = result.filter((player) =>
        selectedPicks.includes(player.pick_number)
      );
    }

    // Фильтрация по количеству матчей
    switch (matchesFilter) {
      case "enough":
        result = result.filter((p) => p.matches >= 10);
        break;
      case "low":
        result = result.filter((p) => p.matches < 10);
        break;
      case "all":
      default:
        result = [...result];
        break;
    }

    // Сортировка
    if (filters.sortColumn) {
      result = [...result].sort((a, b) => {
        const columnKey = columnMapping[filters.sortColumn!];

        const getValue = (player: PlayerStats): number => {
          if (typeof columnKey === "function") return columnKey(player);
          return player[columnKey] as number;
        };

        const valueA = getValue(a);
        const valueB = getValue(b);

        return filters.sortDirection === "desc"
          ? valueA - valueB
          : valueB - valueA;
      });
    }

    // Фильтр "Лучшие по пикам"
    if (showBestByPicks) {
      const picksMap = new Map<number, PlayerStats[]>();

      // Группируем по пикам
      result.forEach((player) => {
        const pick = player.pick_number || 0;
        if (!picksMap.has(pick)) picksMap.set(pick, []);
        picksMap.get(pick)?.push(player);
      });

      // Сортируем внутри каждого пика и берем топ-3
      const bestPlayers: PlayerStats[] = [];
      picksMap.forEach((players) => {
        bestPlayers.push(players[0]);
      });

      result = bestPlayers;
    }

    if (showWinners) {
      const picksMap: PlayerStats[] = [];

      // Группируем по пикам
      result.forEach((player) => {
        if (player.is_winner) {
          picksMap.push(player);
        }
      });

      result = picksMap;
    }

    const enoughMatches = result.filter((player) => player.matches >= 10);
    const lowMatches = result.filter((player) => player.matches < 10);
    result = [...enoughMatches, ...lowMatches];

    return result;
  }, [
    players,
    filters,
    ulTournament,
    range,
    matchesFilter,
    selectedPicks,
    showBestByPicks,
    showWinners,
  ]);

  // Функция для отображения значения ячейки
  const renderCellValue = (player: PlayerStats, column: SortableColumn) => {
    const value = columnMapping[column];

    if (typeof value === "function") {
      const result = value(player);
      switch (column) {
        case "HS%":
          return `${result.toFixed(0)}%`;
        case "ADR":
          return result.toFixed(0);
        case "+/-":
          return result.toFixed(0);
        case "KAST":
          return result.toFixed(0);
        case "IMP":
          return (result * 1.75 + 0.1).toFixed(2);
        default:
          return result.toFixed(2);
      }
    }

    return player[value];
  };

  const handleSortChange = (column: SortableColumn) => {
    setFilters((prev) => {
      if (prev.sortColumn === column) {
        return {
          ...prev,
          sortDirection: prev.sortDirection === "asc" ? "desc" : "asc",
        };
      }
      return {
        ...prev,
        sortColumn: column,
        sortDirection: "asc",
      };
    });
  };

  return (
    <div>
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="my-2">Players Statistics</h1>
          <p className="text-xs">
            Нажатие на имя столба проводит сортировку по его значениям.
          </p>
        </div>

        <div className="flex flex-row mb-2 align-bottom text-sm">
          <div className="btn-group mr-2">
            {ulTournament ? (
              <div className="filters-container">
                {/* Кнопка для лучших по пикам */}
                <button
                  onClick={() => setShowBestByPicks(!showBestByPicks)}
                  className={showBestByPicks ? "active" : ""}
                >
                  {showBestByPicks
                    ? "Сбросить выбор"
                    : "Показать лучших по пикам"}
                </button>
                <button
                  onClick={() => setShowWinners(!showWinners)}
                  className={showWinners ? "active" : ""}
                >
                  {showWinners ? "Сбросить выбор" : "Показать победителей"}
                </button>

                {/* Чекбоксы для выбора пиков */}
                <div className="picks-filter">
                  {[1, 2, 3, 4, 5].map((pick) => (
                    <label key={pick}>
                      <input
                        type="checkbox"
                        checked={selectedPicks.includes(pick)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPicks([...selectedPicks, pick]);
                          } else {
                            setSelectedPicks(
                              selectedPicks.filter((p) => p !== pick)
                            );
                          }
                        }}
                      />
                      Пик {pick}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={`btn btn-sm ${matchesFilter === "all" ? "btn-active" : ""}`}
                  onClick={() => setMatchesFilter("all")}
                >
                  Все
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${matchesFilter === "enough" ? "btn-active" : ""}`}
                  onClick={() => setMatchesFilter("enough")}
                >
                  ЖБ
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${matchesFilter === "low" ? "btn-active" : ""}`}
                  onClick={() => setMatchesFilter("low")}
                >
                  Проходняк
                </button>
              </>
            )}
          </div>

          <DataTableControls
            className=""
            onFilterChange={setRange}
            minRating={0}
            maxRating={100}
          />
          <form className="max-w-sm mx-auto">
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Select an option
            </label>
            <select
              id="countries"
              className="border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-light-dark dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              onChange={(e) => setUlTournament(e.target.value)}
            >
              <option value="" defaultValue="">
                MIX
              </option>
              {sortedTournaments.map((tournament) => (
                <option value={tournament.id} key={tournament.name}>
                  {tournament.name}
                </option>
              ))}
            </select>
          </form>
        </div>
      </div>

      <div className="stats-table-wrapper">
        <div className="stats-grid">
          {/* Заголовки */}
          <div className="grid-header">№</div>
          <div className="grid-header">Nickname</div>
          {Object.keys(columnMapping).map((column) => (
            <div
              key={column}
              className="grid-header cursor-pointer hover:bg-slate-500"
              onClick={() => handleSortChange(column as SortableColumn)}
            >
              {column}
              {filters.sortColumn === column && (
                <span className="ml-2">
                  {filters.sortDirection === "asc" ? "↑" : "↓"}
                </span>
              )}
            </div>
          ))}

          {/* Данные */}
          {filteredData.map((player, index) => {
            const { color } = ratingTier(player.uLRating);
            return (
              <Link
                href={`/player/${player.playerID}`}
                key={
                  player.pick_number +
                  player.playerID +
                  (player.ul_id ? player.ul_id : "")
                }
                className={`grid-row ${
                  player.matches < 10 && player.ul_id == ""
                    ? "[&>*]:opacity-75 bg-gray-800 bg-opacity-50"
                    : ""
                }`}
              >
                <div
                  className="grid-item"
                  style={{
                    backgroundColor: player.pick_number
                      ? "transparent"
                      : "#242424",
                  }}
                >
                  {player.pick_number ? (
                    <Image
                      src={picks[player.pick_number - 1]}
                      alt="pick"
                      width={86}
                      height={58}
                      className="absolute w-[86px] h-[58px] -translate-x-3 -translate-y-1"
                    />
                  ) : (
                    <span className="m-auto">{index + 1}</span>
                  )}
                </div>

                <div className="grid-item flex flex-row">
                  {player.img ? (
                    <Image
                      width={36}
                      height={36}
                      alt="profile img"
                      src={`https://cdn.fastcup.net/avatars/users/${player.img}`}
                      style={{ borderColor: color }}
                      className="rounded-full w-9 h-9 my-auto border-2"
                    />
                  ) : (
                    <div
                      className="rounded-full w-9 h-9 my-auto border-2"
                      style={{ borderColor: color }}
                    ></div>
                  )}

                  <div className="flex flex-col">
                    <span className="ml-4">{player.nickname}</span>
                    <span className="ml-4 text-xs">{player.uLRating}</span>
                  </div>
                </div>

                {Object.keys(columnMapping).map((column) => (
                  <div
                    key={column}
                    className="grid-item"
                    style={{
                      color:
                        column == "Rating" || column == "K/D" || column == "IMP"
                          ? getRatingColor(
                              Number(
                                renderCellValue(
                                  player,
                                  column as SortableColumn
                                )
                              ),
                              0.4,
                              1.4
                            )
                          : "#fff",
                    }}
                  >
                    {renderCellValue(player, column as SortableColumn)}
                  </div>
                ))}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
