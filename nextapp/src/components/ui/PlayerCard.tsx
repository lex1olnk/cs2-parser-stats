import React from "react";

interface PlayerCardProps {
  playerName?: string;
  playerStats?: string;
  rating?: string;
  className?: string;
}

// Альтернативная версия с более точным воспроизведением SVG
export const PlayerCardDetailed: React.FC<PlayerCardProps> = ({
  playerName = "PLAYER NAME",
  playerStats = "PLAYER STATS",
  rating = "RATING",
  className = "",
}) => {
  return (
    <div
      className={`relative w-[393px] h-[173px] bg-black border border-gray-800 rounded-lg ${className}`}
    >
      {/* Угловые элементы с изогнутыми линиями */}
      <div className="absolute inset-0 border border-white/30 rounded-lg">
        {/* Левый верхний угол */}
        <div className="absolute top-2 left-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 2L2 10M2 2L10 2"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Правый верхний угол */}
        <div className="absolute top-2 right-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 2L2 2M10 2L10 10"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Левый нижний угол */}
        <div className="absolute bottom-2 left-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 10L10 10M2 10L2 2"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Правый нижний угол */}
        <div className="absolute bottom-2 right-2">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M10 10L2 10M10 10L10 2"
              stroke="white"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Основной контент */}
      <div className="absolute inset-0 p-6">
        {/* Аватар */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
          <div className="relative">
            <div className="w-20 h-20 bg-gray-900 rounded-full border border-gray-700 flex items-center justify-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full border border-gray-600"></div>
            </div>
          </div>
        </div>

        {/* Текстовая информация */}
        <div className="ml-28 pt-4">
          <div className="text-white font-mono font-bold text-lg mb-1">
            {playerName}
          </div>
          <div className="text-gray-400 font-mono text-sm mb-3">
            {playerStats}
          </div>
          <div className="text-gray-500 font-mono text-xs">{rating}</div>
        </div>

        {/* Правая статистика */}
        <div className="absolute right-6 top-8 text-right">
          <div className="text-white font-mono space-y-1">
            <div className="font-bold">84.5</div>
            <div className="text-gray-400 text-sm">RATING</div>
            <div className="text-gray-500 text-xs mt-2">TOP 15%</div>
          </div>
        </div>

        {/* Декоративные элементы снизу */}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-6 h-px bg-white/50"></div>
                  <div className="w-1 h-px bg-white/30 mx-0.5"></div>
                </div>
              ))}
              <div className="w-6 h-px bg-white/50"></div>
            </div>

            <div className="flex items-center space-x-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="w-6 h-px bg-white/50"></div>
                  <div className="w-1 h-px bg-white/30 mx-0.5"></div>
                </div>
              ))}
              <div className="w-6 h-px bg-white/50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
