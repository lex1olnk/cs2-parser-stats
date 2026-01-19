import React from "react";
import { Match, MatchNew } from "@/types";

interface MatchCardProps {
  match: MatchNew;
  onDelete: (matchId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onDelete,
  getStatusColor,
  getStatusText,
}) => {
  const handleDelete = () => {
    if (
      confirm(
        "Вы уверены, что хотите удалить этот матч? Все связанные данные также будут удалены."
      )
    ) {
      onDelete(match.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <TournamentInfo match={match} />
          <MatchInfo match={match} />
          {match.text && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 line-clamp-2">{match.text}</p>
            </div>
          )}
        </div>
        <MatchActions
          match={match}
          onDelete={handleDelete}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      </div>
    </div>
  );
};

const TournamentInfo: React.FC<{ match: MatchNew }> = ({ match }) => (
  <div className="flex items-center space-x-3 mb-3">
    {match.tournament ? (
      <div className="flex items-center space-x-2">
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
          {match.tournament.name}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded ${
            match.tournament.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {match.tournament.status === "active" ? "Активный" : "Завершен"}
        </span>
      </div>
    ) : (
      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
        Без турнира
      </span>
    )}
  </div>
);

const MatchInfo: React.FC<{ match: MatchNew }> = ({ match }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">Матч #{match.id}</h4>
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Формат:</span>
          <span>
            Best of {match.bestOf} • {match.type}
          </span>
        </div>
        {match.teams && match.teams.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="font-medium">Команды:</span>
            <span className="text-gray-800">{match.teams.join(" vs ")}</span>
          </div>
        )}
      </div>
    </div>

    <div className="text-sm text-gray-600">
      <div className="space-y-1">
        <DateInfo
          icon="calendar"
          text={`Создан: ${new Date(match.startedAt).toLocaleDateString("ru-RU")}`}
        />
        <DateInfo
          icon="refresh"
          text={`Обновлен: ${new Date(match.updatedAt).toLocaleDateString("ru-RU")}`}
        />
      </div>
    </div>
  </div>
);

const DateInfo: React.FC<{ icon: string; text: string }> = ({ icon, text }) => {
  const Icon = icon === "calendar" ? CalendarIcon : RefreshIcon;
  return (
    <div className="flex items-center space-x-2">
      <Icon />
      <span>{text}</span>
    </div>
  );
};

const CalendarIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

const MatchActions: React.FC<{
  match: MatchNew;
  onDelete: () => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}> = ({ match, onDelete, getStatusColor, getStatusText }) => (
  <div className="flex flex-col items-end space-y-2 ml-4 min-w-[140px]">
    <div className="flex space-x-2">
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
        title="Удалить матч"
      >
        <TrashIcon />
      </button>
    </div>

    <div className="flex flex-col space-y-2">
      <span
        className={`px-2 py-1 rounded text-xs border text-center ${
          match.isFinal
            ? "bg-yellow-100 text-yellow-800 border-yellow-200 font-medium"
            : "bg-gray-100 text-gray-600 border-gray-200"
        }`}
      >
        {match.isFinal ? "Финальный" : "Обычный"}
      </span>
      <span
        className={`px-2 py-1 rounded text-xs border text-center ${getStatusColor(
          match.status
        )}`}
      >
        {getStatusText(match.status)}
      </span>
    </div>

    {match.url && (
      <a
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 text-xs flex items-center justify-center space-x-1 mt-2"
      >
        <ExternalLinkIcon />
        <span>Ссылка</span>
      </a>
    )}
  </div>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  </svg>
);
