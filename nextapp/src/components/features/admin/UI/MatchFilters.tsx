import React from "react";
import { Tournament } from "@/types/tournament";

interface Filters {
  tournamentId: string;
  status: string;
  dateFrom: string;
  sortBy: string;
}

interface MatchFiltersProps {
  filters: Filters;
  tournaments: Tournament[];
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  filters,
  tournaments,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== "startedAt_desc"
  );

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FilterSelect
          label="Турнир"
          value={filters.tournamentId}
          onChange={(value) => onFilterChange("tournamentId", value)}
          options={[
            { value: "", label: "Все турниры" },
            ...(tournaments?.map((t) => ({ value: t.id, label: t.name })) ||
              []),
          ]}
        />

        <FilterSelect
          label="Статус"
          value={filters.status}
          onChange={(value) => onFilterChange("status", value)}
          options={[
            { value: "", label: "Все статусы" },
            { value: "pending", label: "Ожидание" },
            { value: "ongoing", label: "В процессе" },
            { value: "completed", label: "Завершен" },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата с
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFilterChange("dateFrom", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <FilterSelect
          label="Сортировка"
          value={filters.sortBy}
          onChange={(value) => onFilterChange("sortBy", value)}
          options={[
            { value: "startedAt_desc", label: "Дата (новые)" },
            { value: "startedAt_asc", label: "Дата (старые)" },
            { value: "tournamentId_asc", label: "Турнир (А-Я)" },
            { value: "status_asc", label: "Статус" },
          ]}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onClearFilters}
            className="text-gray-600 hover:text-gray-800 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
};

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
