import React from "react";

export const EmptyState: React.FC = () => (
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
      "Матчи не найдены"
    </h3>
    <p className="text-gray-600 mb-4">
      Используйте кнопку 'Добавить матчи' чтобы начать импорт матчей из
      текстового списка
    </p>
  </div>
);
