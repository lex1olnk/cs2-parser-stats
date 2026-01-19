// app/player/[id]/weapons/weapons-skeleton.tsx
export function WeaponsSkeleton() {
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    minHeight: "1200px",
    margin: "0 auto",
    fontFamily: "'Courier New', monospace",
  };

  const headerStyle: React.CSSProperties = {
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "40px",
    paddingTop: "30px",
    textTransform: "uppercase",
    letterSpacing: "3px",
  };

  const graphContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "1000px",
    margin: "0 auto",
    border: "none",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div className="h-6 bg-gray-700 rounded w-1/3 mx-auto mb-4 animate-pulse">
          Weapon Distribution Graph with Figures
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="h-4 bg-gray-700 rounded w-1/4 mx-auto animate-pulse">
          SYSTEM_GRAPH_VIEW // BRANCH_FIGURES_ENABLED
        </div>
      </div>

      <div style={graphContainerStyle}>
        <div className="flex justify-center items-start h-full">
          {/* Скелетон для графа */}
          <div className="relative">
            {/* Основная линия */}
            <div className="w-1 bg-gray-700 h-96 animate-pulse"></div>

            {/* Ветки */}
            <div className="absolute top-20 -right-20 w-20 h-1 bg-gray-700 animate-pulse"></div>
            <div className="absolute top-40 -left-20 w-20 h-1 bg-gray-700 animate-pulse"></div>
            <div className="absolute top-60 -right-20 w-20 h-1 bg-gray-700 animate-pulse"></div>

            {/* Фигуры скелетоны */}
            <div className="absolute top-16 -right-32 w-24 h-16 bg-gray-700 rounded animate-pulse"></div>
            <div className="absolute top-36 -left-32 w-24 h-16 bg-gray-700 rounded animate-pulse"></div>
            <div className="absolute top-56 -right-32 w-24 h-16 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <div className="h-3 bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}
