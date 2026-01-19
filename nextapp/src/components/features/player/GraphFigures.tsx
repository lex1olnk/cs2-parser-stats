interface FigureProps {
  x: number;
  y: number;
  color?: string;
  strokeWidth?: number;
  rows: { key: string; value: number }[];
  title?: string;
  showWeaponImage?: boolean;
}

export const FigureOne = ({
  x,
  y,
  color = "black",
  strokeWidth = 0.5,
  title = "asdsa",
  rows,
  showWeaponImage = true,
}: FigureProps) => {
  const weaponImage = String(x);
  y = y;
  const svgYSize = 75 + rows.length * 27; // Увеличено на 1.5 раза

  return (
    <>
      {/* Новая SVG фигура */}
      <svg
        key={title}
        width="418.5" // 279 * 1.5 = 418.5
        height={svgYSize}
        viewBox={"0 0 418.5 " + svgYSize}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          left: x,
          top: y,
        }}
      >
        <text x="405" y="32" textAnchor="end" fill={color} fontSize="24">
          {" "}
          {/* 14 * 1.5 = 21 */}
          {title}
        </text>
        {rows.map((row, index) => (
          <text
            key={row.key}
            x={202.5} // 135 * 1.5 = 202.5
            y={66 + index * 27} // 44 * 1.5 = 66, 18 * 1.5 = 27
            textAnchor="start"
            fill={color}
            fontSize="16" // 14 * 1.5 = 21
          >
            {row.key}
          </text>
        ))}
        {rows.map((row, index) => (
          <text
            key={row.key}
            x={390} // 270 * 1.5 = 405
            y={66 + index * 27} // 44 * 1.5 = 66, 18 * 1.5 = 27
            textAnchor="end"
            fill={color}
            fontSize="16" // 14 * 1.5 = 21
          >
            {row.value}
          </text>
        ))}
        {/* Основные пути */}
        <path
          d="M1.5 0.75L82.5 81.75L163.5 0.75H417" // Масштабированы координаты
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <path
          d="M219.75 5.25H417V52.5L394.5 75.75H194.25V30.75L219.75 5.25Z" // Масштабированы координаты
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <path
          d="M410.25 11.25V41.25"
          stroke={color}
          strokeWidth={strokeWidth}
        />{" "}
        {/* Масштабированы координаты */}
      </svg>

      {/* Изображение оружия позиционируется отдельно */}
      {showWeaponImage && (
        <div
          style={{
            position: "absolute",
            left: x + 220.5, // 147 * 1.5 = 220.5
            top: y + 6, // 4 * 1.5 = 6
            width: "195px", // 130 * 1.5 = 195
            height: "69px", // 46 * 1.5 = 69
            mixBlendMode: "screen",
            backgroundImage: `url(${weaponImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </>
  );
};

export const FigureTwo = ({
  x,
  y,
  color = "black",
  strokeWidth = 0.5,
  title = "asdsa",
  rows,
  showWeaponImage = true,
}: FigureProps) => {
  x = x - 288; // 192 * 1.5 = 288
  return (
    <>
      <svg
        width="288" // 192 * 1.5 = 288
        height="211.5" // 141 * 1.5 = 211.5
        viewBox="0 0 288 211.5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          left: x,
          top: y,
        }}
      >
        {/* Основные контуры фигуры */}
        <path
          d="M287.25 1.5L249.75 39M249.75 39H9.75V168L44.25 202.5H249.75V39ZM94.5 197.25H48.75L16.5 165" // Масштабированы координаты
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <path d="M1.5 153V48" stroke={color} strokeWidth={strokeWidth} />{" "}
        {/* Масштабированы координаты */}
        <path
          d="M56.25 210H128.25" // Масштабированы координаты
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <text x="250" y="24" textAnchor="end" fill={color} fontSize="24">
          {" "}
          {/* 14 * 1.5 = 21 */}
          {title}
        </text>
        {rows.map((row, index) => (
          <text
            key={title + row.key}
            x={30} // 135 * 1.5 = 202.5
            y={66 + index * 27} // 44 * 1.5 = 66, 18 * 1.5 = 27
            textAnchor="start"
            fill={color}
            fontSize="16" // 14 * 1.5 = 21
          >
            {row.key}
          </text>
        ))}
        {rows.map((row, index) => (
          <text
            key={title + row.key + index}
            x={230} // 270 * 1.5 = 405
            y={66 + index * 27} // 44 * 1.5 = 66, 18 * 1.5 = 27
            textAnchor="end"
            fill={color}
            fontSize="16" // 14 * 1.5 = 21
          >
            {row.value}
          </text>
        ))}
      </svg>

      {/* Изображение оружия позиционируется отдельно */}
      {showWeaponImage && (
        <div
          style={{
            position: "absolute",
            left: x + 150, // 100 * 1.5 = 150
            top: y + 30, // 20 * 1.5 = 30
            width: "120px", // 80 * 1.5 = 120
            height: "90px", // 60 * 1.5 = 90
            mixBlendMode: "screen",
            backgroundImage: `url(${"asd"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </>
  );
};

export const FigureThree = ({
  x,
  y,
  color = "black",
  strokeWidth = 0.5,
  title = "Title",
  showWeaponImage = true,
  rows = [
    { key: "Row1", value: 1 },
    { key: "Row2", value: 2 },
    { key: "Row3", value: 3 },
  ],
}: FigureProps) => {
  y = y - 55.5; // 37 * 1.5 = 55.5
  return (
    <>
      <svg
        width="357" // 238 * 1.5 = 357
        height="360" // 139 * 1.5 = 208.5
        viewBox="0 0 357 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          left: x,
          top: y,
        }}
      >
        {/* Основные контуры фигуры */}
        <path
          d="M0.75 54.75L54.75 0.75H111V207H357" // Масштабированы координаты
          stroke={color}
          strokeWidth={strokeWidth}
        />
        <text x="120" y="165" textAnchor="start" fill={color} fontSize="24">
          {" "}
          {/* 14 * 1.5 = 21 */}
          {title}
        </text>
        {rows.map((row, index) => (
          <text
            key={"three" + title + row.key}
            x={120} // 135 * 1.5 = 202.5
            y={195 + index * 27} // 44 * 1.5 = 66, 18 * 1.5 = 27
            textAnchor="start"
            fill={color}
            fontSize="16" // 14 * 1.5 = 21
          >
            {row.key}
          </text>
        ))}
        {rows.map((row, index) => (
          <text
            key={"three" + title + row.key + "value"}
            x={340} // 270 * 1.5 = 405
            y={195 + index * 27} // 44 * 1.5 = 66, 18 * 1.5 = 27
            textAnchor="end"
            fill={color}
            fontSize="16" // 14 * 1.5 = 21
          >
            {row.value}
          </text>
        ))}
      </svg>

      {/* Заголовок */}

      {/* Изображение оружия позиционируется отдельно */}
      {showWeaponImage && (
        <div
          style={{
            position: "absolute",
            left: x + 150, // 100 * 1.5 = 150
            top: y + 60, // 40 * 1.5 = 60
            width: "120px", // 80 * 1.5 = 120
            height: "90px", // 60 * 1.5 = 90
            mixBlendMode: "screen",
            backgroundImage: `url(${"asds"})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}
    </>
  );
};
