import React from "react";

interface PlayerWinRateProps {
  playerName: string;
  winRate: number;
}

const PlayerWinRate: React.FC<PlayerWinRateProps> = ({
  playerName,
  winRate,
}) => {
  return (
    <div
      style={{
        display: "flex",
        height: 48,
        justifyContent: "space-between",
        padding: 2,
        backgroundColor: "white",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: "500",
          color: "#334155",
        }}
      >
        {playerName}
      </span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "black",
        }}
      >
        {winRate}%
      </span>
    </div>
  );
};

interface SuccessRowProps {
  label: string;
  value: string | number;
  color?: string;
}

const SuccessRow: React.FC<SuccessRowProps> = ({
  label,
  value,
  color = "#334155",
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
      }}
    >
      <span
        style={{
          fontSize: "13px",
          color: color,
          fontWeight: "500",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          fontWeight: "bold",
          color: color,
        }}
      >
        {value}
      </span>
    </div>
  );
};

interface PlayerStatsBlockProps {
  title: string;
  playerName: string;
  winRate: number;
  successRows: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

export const PlayerStatsBlock: React.FC<PlayerStatsBlockProps> = ({
  title,
  playerName,
  winRate,
  successRows,
}) => {
  return (
    <div
      style={{
        padding: "16px",
        minWidth: "200px",
      }}
    >
      {/* Название блока */}
      <h3
        style={{
          marginBottom: 4,
          fontSize: "16px",
          fontWeight: "600",
          color: "white",
        }}
      >
        {title}
      </h3>

      {/* Компонент игрока с процентом побед */}
      <PlayerWinRate playerName={playerName} winRate={winRate} />

      {/* Разделительная линия */}
      <div
        style={{
          height: "1px",
          backgroundColor: "#e2e8f0",
          margin: "12px 0",
        }}
      />

      {/* Две строки Success */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {successRows.map((row, index) => (
          <SuccessRow
            key={index}
            label={row.label}
            value={row.value}
            color={row.color}
          />
        ))}
      </div>
    </div>
  );
};
