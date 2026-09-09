import React, { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store";
import type { MatchQueryParams } from "@/types/match";
import { deleteMatch } from "@/services/client";
import {
  SessionItem,
  ProcessingSession,
} from "@/components/features/admin/UI/SessionItem";
import { MatchFilters } from "@/components/features/admin/UI/MatchFilters";
import { LocalDemoImport } from "@/components/features/admin/UI/LocalDemoImport";
import { MatchCard } from "@/components/features/admin/UI/MatchCard";
import { LoadingState } from "@/components/features/admin/UI/LoadingState";
import { ErrorState } from "@/components/features/admin/UI/ErrorState";
import { EmptyState } from "@/components/features/admin/UI/EmptyState";

interface Filters {
  tournamentId: string | null;
  status: string;
  dateFrom: string;
  sortBy: string;
}

const INITIAL_FILTERS: Filters = {
  tournamentId: null,
  status: "",
  dateFrom: "",
  sortBy: "startedAt_desc",
};

const PAGINATION_CONFIG = {
  take: 10,
};

export const MatchManagement: React.FC = () => {
  const setShowMatchForm = useStore((state) => state.setShowMatchForm);
  const fetchMatches = useStore((state) => state.fetchMatches);
  const tournaments = useStore((state) => state.tournaments);
  const fetchTournaments = useStore((state) => state.fetchTournaments);
  const matches = useStore((state) => state.matches);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const setFilters = useStore((state) => state.setFilters);

  const [pagination, setPagination] = useState({
    skip: 0,
    take: PAGINATION_CONFIG.take,
    total: 0,
  });

  const [activeSessions, setActiveSessions] = useState<ProcessingSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Загрузка данных
  useEffect(() => {
    fetchTournaments();
    loadMatches();
    loadAllSessions();
  }, [pagination.skip, pagination.take]);

  // Обработка событий от AddMatchForm
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "NEW_SESSIONS_CREATED") {
        console.log("🔄 New sessions detected, refreshing...");
        setLastUpdate(Date.now());

        const newSessionCount = event.data.sessions.filter(
          (s: any) => s.status === "pending",
        ).length;
        if (newSessionCount > 0) {
          console.log(`Начата обработка ${newSessionCount} матчей`);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Авто-обновление сессий
  useEffect(() => {
    loadAllSessions();

    const intervalTime = activeSessions.length > 0 ? 3000 : 15000;
    const interval = setInterval(loadAllSessions, intervalTime);

    return () => clearInterval(interval);
  }, [lastUpdate, activeSessions.length]);

  // Обновление при фокусе окна
  useEffect(() => {
    const handleFocus = () => {
      loadAllSessions();
      loadMatches();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const loadAllSessions = useCallback(async () => {
    try {
      setSessionsLoading(true);
      const response = await fetch("/api/matches/sessions");
      if (response.ok) {
        const newSessions = await response.json();
        setActiveSessions((prev) =>
          hasSessionsChanged(prev, newSessions) ? newSessions : prev,
        );
      }
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadMatches = async () => {
    try {
      const params: MatchQueryParams = {
        skip: pagination.skip,
        take: pagination.take,
        include: JSON.stringify({ tournament: true }),
      };
      await fetchMatches(params);
    } catch (err) {
      console.error("Failed to load matches:", err);
    }
  };

  const handlePageChange = (newSkip: number) => {
    setPagination((prev) => ({ ...prev, skip: newSkip }));
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
      await loadMatches();
    } catch (err) {
      console.error("Failed to delete match:", err);
    }
  };

  const handleForceRefresh = () => {
    setLastUpdate(Date.now());
    loadMatches();
  };

  return (
    <div className="p-6">
      <Header
        onAddMatch={() => setShowMatchForm(true)}
        onRefresh={handleForceRefresh}
      />

      <LocalDemoImport
        tournaments={tournaments || []}
        onImportStarted={handleForceRefresh}
      />

      <ActiveSessions
        sessions={activeSessions}
        getSessionStatusColor={getSessionStatusColor}
        getSessionStatusText={getSessionStatusText}
      />
      {/*
      <MatchFilters
        filters={filters}
        tournaments={tournaments || []}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />
      */}
      <ContentSection
        loading={loading}
        error={error}
        matches={matches}
        //hasActiveFilters={hasActiveFilters}
        onRetry={loadMatches}
        //onClearFilters={clearFilters}
        pagination={pagination}
        onPageChange={handlePageChange}
        onDeleteMatch={handleDeleteMatch}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />
    </div>
  );
};

// Вспомогательные компоненты
const Header: React.FC<{ onAddMatch: () => void; onRefresh: () => void }> = ({
  onAddMatch,
  onRefresh,
}) => (
  <div className="flex justify-between items-center mb-6">
    <div className="flex items-center space-x-4">
      <h2 className="text-2xl font-bold text-gray-800">Управление матчами</h2>
      <RefreshButton onRefresh={onRefresh} />
    </div>
    <button
      onClick={onAddMatch}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center"
    >
      <span>+ Добавить матчи</span>
    </button>
  </div>
);

const RefreshButton: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <button
    onClick={onRefresh}
    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
    title="Обновить"
  >
    <svg
      className="w-5 h-5"
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
  </button>
);

const ActiveSessions: React.FC<{
  sessions: ProcessingSession[];
  getSessionStatusColor: (status: string) => string;
  getSessionStatusText: (status: string) => string;
}> = ({ sessions, getSessionStatusColor, getSessionStatusText }) => {
  if (sessions.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Сессии обработки ({sessions.length})
        <span className="text-sm font-normal text-gray-600 ml-2">
          • показаны за последние 24 часа
        </span>
      </h3>
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionItem
            key={session.sessionId}
            session={session}
            getSessionStatusColor={getSessionStatusColor}
            getSessionStatusText={getSessionStatusText}
          />
        ))}
      </div>
    </div>
  );
};

const ContentSection: React.FC<{
  loading: boolean;
  error: string | null;
  matches: any[] | null;
  hasActiveFilters?: boolean;
  onRetry: () => void;
  onClearFilters?: () => void;
  pagination: { skip: number; take: number; total: number };
  onPageChange: (skip: number) => void;
  onDeleteMatch: (matchId: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}> = ({
  loading,
  error,
  matches,
  hasActiveFilters,
  onRetry,
  onClearFilters,
  pagination,
  onPageChange,
  onDeleteMatch,
  getStatusColor,
  getStatusText,
}) => {
  if (loading) return <LoadingState />;
  if (error && !matches) return <ErrorState error={error} onRetry={onRetry} />;
  if (!matches || matches.length === 0) return <EmptyState />;

  return (
    <div className="space-y-4">
      <PaginationHeader pagination={pagination} onPageChange={onPageChange} />

      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onDelete={onDeleteMatch}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      ))}

      <PaginationFooter pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
};

const PaginationHeader: React.FC<{
  pagination: { skip: number; take: number; total: number };
  onPageChange: (skip: number) => void;
}> = ({ pagination, onPageChange }) => (
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-semibold">
      Найдено матчей: {pagination.total}
    </h3>
    {pagination.total > pagination.take && (
      <PaginationControls pagination={pagination} onPageChange={onPageChange} />
    )}
  </div>
);

const PaginationFooter: React.FC<{
  pagination: { skip: number; take: number; total: number };
  onPageChange: (skip: number) => void;
}> = ({ pagination, onPageChange }) =>
  pagination.total > pagination.take && (
    <div className="flex justify-center">
      <PaginationControls pagination={pagination} onPageChange={onPageChange} />
    </div>
  );

const PaginationControls: React.FC<{
  pagination: { skip: number; take: number; total: number };
  onPageChange: (skip: number) => void;
}> = ({ pagination, onPageChange }) => {
  const currentPage = Math.floor(pagination.skip / pagination.take) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.take);

  return (
    <div className="flex space-x-2">
      <button
        onClick={() =>
          onPageChange(Math.max(0, pagination.skip - pagination.take))
        }
        disabled={pagination.skip === 0}
        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Назад
      </button>
      <span className="px-3 py-1 text-sm text-gray-600">
        {pagination.skip + 1}-
        {Math.min(pagination.skip + pagination.take, pagination.total)} из{" "}
        {pagination.total}
      </span>
      <button
        onClick={() => onPageChange(pagination.skip + pagination.take)}
        disabled={pagination.skip + pagination.take >= pagination.total}
        className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Вперед
      </button>
    </div>
  );
};

// Вспомогательные функции
const hasSessionsChanged = (
  prev: ProcessingSession[],
  next: ProcessingSession[],
): boolean => {
  if (prev.length !== next.length) return true;

  return prev.some((prevSession, index) => {
    const newSession = next[index];
    return (
      prevSession.sessionId !== newSession.sessionId ||
      prevSession.status !== newSession.status ||
      prevSession.processedMatches !== newSession.processedMatches ||
      JSON.stringify(prevSession.matches) !== JSON.stringify(newSession.matches)
    );
  });
};

const getOrderBy = (sortBy: string) => {
  const [field, direction] = sortBy.split("_");
  return JSON.stringify({ [field]: direction });
};

const buildWhereClause = (filters: Filters) => ({
  ...(filters.tournamentId && { tournamentId: filters.tournamentId }),
  ...(filters.status && { status: filters.status }),
  ...(filters.dateFrom && {
    startedAt: { gte: new Date(filters.dateFrom).toISOString() },
  }),
});

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: "Ожидание",
    ongoing: "В процессе",
    completed: "Завершен",
  };
  return statusMap[status] || status;
};

const getStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    ongoing: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getSessionStatusColor = (status: string) => {
  const colorMap: { [key: string]: string } = {
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    downloading: "bg-purple-100 text-purple-800 border-purple-200",
    parsing: "bg-orange-100 text-orange-800 border-orange-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getSessionStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    processing: "Обработка",
    downloading: "Скачивание",
    parsing: "Парсинг",
    completed: "Завершено",
    error: "Ошибка",
  };
  return statusMap[status] || status;
};

export default MatchManagement;
