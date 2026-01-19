// components/ProgressBar.tsx
import React from "react";
import { ProcessingProgress } from "@/types/demo-processing";

interface ProgressBarProps {
  progress: ProcessingProgress;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "parsing":
        return "bg-blue-500";
      case "downloading":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Завершено";
      case "error":
        return "Ошибка";
      case "parsing":
        return "Парсинг";
      case "downloading":
        return "Скачивание";
      default:
        return "Ожидание";
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Заголовок */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Обработка матчей ({progress.processedMatches}/
            {progress.totalMatches})
          </h3>
          <span className="text-sm font-medium text-gray-600">
            {progress.overallProgress}%
          </span>
        </div>
      </div>

      {/* Общий прогресс бар */}
      <div className="px-4 py-3">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Общий прогресс</span>
          <span>{progress.overallProgress}%</span>
        </div>
      </div>

      {/* Детали по матчам */}
      <div className="max-h-60 overflow-y-auto">
        {progress.matches.map((match, index) => (
          <div
            key={match.url}
            className={`border-t border-gray-100 px-4 py-3 ${
              match.status === "error"
                ? "bg-red-50"
                : match.status === "completed"
                  ? "bg-green-50"
                  : "bg-white"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {match.url}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)} text-white`}
                  >
                    {getStatusText(match.status)}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {match.platform}
                  </span>
                </div>
                {match.currentStep && (
                  <p className="text-xs text-gray-600 mt-1">
                    {match.currentStep}
                  </p>
                )}
                {match.error && (
                  <p className="text-xs text-red-600 mt-1">{match.error}</p>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 ml-3">
                {match.progress}%
              </span>
            </div>

            {/* Прогресс бар для отдельного матча */}
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  match.status === "completed"
                    ? "bg-green-500"
                    : match.status === "error"
                      ? "bg-red-500"
                      : match.status === "parsing"
                        ? "bg-blue-500"
                        : match.status === "downloading"
                          ? "bg-yellow-500"
                          : "bg-gray-400"
                }`}
                style={{ width: `${match.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Статус сессии */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            {progress.status === "processing"
              ? "Обработка..."
              : progress.status === "completed"
                ? "Все матчи обработаны"
                : "Ошибка обработки"}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            {progress.sessionId.slice(0, 8)}...
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
