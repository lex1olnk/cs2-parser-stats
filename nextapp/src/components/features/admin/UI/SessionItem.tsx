import { type MatchItem } from "@/types";
import React from "react";

export interface ProcessingSession {
  sessionId: string;
  status: string;
  totalMatches: number;
  processedMatches: number;
  matches: MatchItem[];
  createdAt: string;
  updatedAt: string;
}

interface SessionItemProps {
  session: ProcessingSession;
  getSessionStatusColor: (status: string) => string;
  getSessionStatusText: (status: string) => string;
}

const MatchProgress: React.FC<{ match: MatchItem }> = ({ match }) => (
  <div className="flex items-center space-x-2">
    <span className="text-xs text-gray-500 w-8">{match.progress}%</span>
    <div className="w-64 bg-gray-200 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${
          match.status === "completed"
            ? "bg-green-500"
            : match.status === "error"
              ? "bg-red-500"
              : "bg-blue-500"
        }`}
        style={{ width: `${match.progress}%` }}
      />
    </div>
  </div>
);

const MatchItem: React.FC<{
  match: MatchItem;
  index: number;
  sessionId: string;
  getSessionStatusColor: (status: string) => string;
  getSessionStatusText: (status: string) => string;
}> = ({
  match,
  index,
  sessionId,
  getSessionStatusColor,
  getSessionStatusText,
}) => (
  <div
    className={`flex justify-between items-center text-sm p-2 rounded transition-colors duration-300 ${
      match.status === "completed"
        ? "bg-green-100 border border-green-200"
        : match.status === "error"
          ? "bg-red-100 border border-red-200"
          : "bg-gray-50"
    }`}
  >
    <div className="flex-1 truncate mr-2">
      <span className="font-medium">{match.url}</span>
      <div className="text-xs text-gray-500">
        {match.currentStep}
        {match.error && (
          <span className="text-red-600 ml-2">• {match.error}</span>
        )}
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <span
        className={`px-2 py-1 rounded text-xs ${getSessionStatusColor(
          match.status
        )}`}
      >
        {getSessionStatusText(match.status)}
      </span>
      <MatchProgress match={match} />
    </div>
  </div>
);

export const SessionItem: React.FC<SessionItemProps> = React.memo(
  ({ session, getSessionStatusColor, getSessionStatusText }) => {
    const sessionBorderClass =
      session.status === "completed"
        ? "border-green-200 bg-green-50"
        : session.status === "error"
          ? "border-red-200 bg-red-50"
          : "border-gray-200";

    return (
      <div
        className={`bg-white border rounded-lg p-4 transition-all duration-300 ease-in-out animate-fadeIn ${sessionBorderClass}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-gray-900">
              Сессия: {session.sessionId.slice(0, 64)}...
            </h4>
            <p className="text-sm text-gray-600">
              Создана: {new Date(session.createdAt).toLocaleString("ru-RU")}
              {session.status === "completed" && session.updatedAt && (
                <span className="ml-2">
                  • Завершена:{" "}
                  {new Date(session.updatedAt).toLocaleString("ru-RU")}
                </span>
              )}
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs border ${getSessionStatusColor(
              session.status
            )}`}
          >
            {getSessionStatusText(session.status)}
          </span>
        </div>

        <div className="space-y-2">
          {session.matches.map((match, index) => (
            <MatchItem
              key={`${session.sessionId}-${index}`}
              match={match}
              index={index}
              sessionId={session.sessionId}
              getSessionStatusColor={getSessionStatusColor}
              getSessionStatusText={getSessionStatusText}
            />
          ))}
        </div>
      </div>
    );
  }
);

SessionItem.displayName = "SessionItem";
