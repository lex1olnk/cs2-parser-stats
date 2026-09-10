import React from "react";

/**
 * Пустой список матчей. Причин у пустоты две, и подсказка у них разная:
 * матчей нет вовсе — значит, надо импортировать; матчи есть, но их отсёк
 * фильтр — значит, надо сбросить фильтр, а не идти импортировать заново.
 */
export const EmptyState: React.FC<{
  filtered?: boolean;
  onClearFilters?: () => void;
}> = ({ filtered = false, onClearFilters }) => (
  <div className="bg-gray-50 rounded-lg p-6 text-center">
    <div className="text-gray-500 mb-4">
      <svg
        className="w-16 h-16 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      {filtered ? "Под фильтр ничего не подошло" : "«Матчи не найдены»"}
    </h3>
    <p className="text-gray-600 mb-4">
      {filtered
        ? "Попробуйте ослабить условия отбора или сбросить их."
        : "Используйте кнопку «Добавить матчи» чтобы начать импорт матчей из текстового списка"}
    </p>
    {filtered && onClearFilters && (
      <button
        onClick={onClearFilters}
        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
      >
        Сбросить фильтры
      </button>
    )}
  </div>
);
