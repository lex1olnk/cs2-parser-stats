"use client";

interface ClutchView {
  amount: number;
  success: boolean;
  count: number;
}

interface ClutchViewProps {
  data: ClutchView[];
}

export const ClutchView = ({ data }: ClutchViewProps) => {
  const groupedData = data.reduce(
    (acc, item) => {
      if (!acc[item.amount]) {
        acc[item.amount] = { won: 0, lost: 0 };
      }
      if (item.success) {
        acc[item.amount].won += item.count;
      } else {
        acc[item.amount].lost += item.count;
      }
      return acc;
    },
    {} as Record<number, { won: number; lost: number }>
  );

  const clutchSituations = [1, 2, 3, 4, 5]
    .map((amount) => {
      const situation = groupedData[amount] || { won: 0, lost: 0 };
      const total = situation.won + situation.lost;
      const winRate = total > 0 ? Math.round((situation.won / total) * 100) : 0;
      const loseRate = 100 - winRate;

      return {
        amount,
        label: `1 vs ${amount}`,
        won: situation.won,
        lost: situation.lost,
        total,
        winRate,
        loseRate,
      };
    })
    .filter((s) => s.total > 0); // Показываем только если были раунды

  if (clutchSituations.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-white mb-8 text-center uppercase tracking-wider">
        Clutch Situations
      </h2>

      {/* Используем Grid: 
          1 колонка на мобилках (grid-cols-1)
          2 колонки на планшетах (sm:grid-cols-2)
          Авто-колонки на десктопе (lg:flex)
      */}
      <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-2">
        {clutchSituations.map((situation) => (
          <div
            key={situation.amount}
            className="flex flex-col gap-2"
            style={{
              // На больших экранах сохраняем пропорцию от кол-ва раундов
              flex: `${situation.total} 1 200px`,
            }}
          >
            {/* Заголовок и инфо */}
            <div className="flex justify-between items-baseline lg:flex-col lg:justify-start">
              <span className="text-lg font-black text-white italic">
                {situation.label}
              </span>
              <span className="text-sm text-gray-400 font-medium">
                {situation.total} {situation.total === 1 ? "round" : "rounds"}
              </span>
            </div>

            {/* Полоска статистики */}
            <div className="flex h-12 border-white border-[1px] overflow-hidden rounded-sm">
              {/* Победы */}
              <div
                className="bg-white flex items-center justify-center transition-all duration-500"
                style={{ flex: `${situation.winRate} 0 auto` }}
              >
                <span className="text-black font-black text-sm md:text-base">
                  {situation.winRate > 10 ? `${situation.winRate}%` : ""}
                </span>
              </div>

              {/* Поражения */}
              <div
                className="bg-black flex items-center justify-center transition-all duration-500"
                style={{ flex: `${situation.loseRate} 0 auto` }}
              >
                <span className="text-white font-black text-sm md:text-base">
                  {situation.loseRate > 10 ? `${situation.loseRate}%` : ""}
                </span>
              </div>
            </div>

            {/* Дополнительная мини-статистика снизу (только для мобилок для ясности) */}
            <div className="flex justify-between text-[10px] uppercase text-gray-500 font-bold lg:hidden">
              <span>Won: {situation.won}</span>
              <span>Lost: {situation.lost}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
