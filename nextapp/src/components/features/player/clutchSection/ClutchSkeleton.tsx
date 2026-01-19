// components/ClutchSectionSkeleton.tsx
export const ClutchSkeleton = () => {
  return (
    <div className="w-7xl mx-auto animate-pulse">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Clutch Situations
      </h2>

      <div className="flex flex-row">
        {[1, 2, 3, 4, 5].map((situation) => (
          <div
            key={situation}
            style={{
              flex: `${6 - situation} 1 100px`,
            }}
          >
            {/* Заголовок */}
            <div className="text-lg font-bold text-white">{situation}</div>

            {/* Процент побед на белом фоне */}
            <div className="flex-row flex border-white border-[1px]">
              <div
                className="bg-white p-3"
                style={{
                  flex: `${situation} 1 80px`,
                }}
              >
                <div className="text-xl font-bold text-gray-900">
                  {situation}%
                </div>
              </div>

              {/* Процент поражений на черном фоне */}
              <div
                className="bg-black p-3"
                style={{
                  flex: `${situation} 1 80px`,
                }}
              >
                <div className="text-xl font-bold text-white">{situation}%</div>
              </div>
            </div>

            {/* Количество клатчей */}

            <div className="text-lg text-gray-300">{situation} rounds</div>

            {/* 
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>W: {situation.won}</span>
              <span>L: {situation.lost}</span>
            </div>
            Детальная статистика */}
          </div>
        ))}
      </div>
    </div>
  );
};
