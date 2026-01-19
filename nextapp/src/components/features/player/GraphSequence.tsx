"use client";

import { useEffect, useState } from "react";

// Expanded directions for 45-degree multiples
export type LineDirection =
  | "down"
  | "down-right"
  | "down-left"
  | "up"
  | "up-right"
  | "up-left"
  | "right"
  | "left";

interface FigureProps {
  x: number;
  y: number;
}
// Extended interface for graph nodes with branches
export interface GraphNode {
  index: number;
  direction: LineDirection;
  length?: number;
  hasBranch?: boolean;
  branchSide?: "left" | "right";
  branchLength?: number;
  children?: (props: { x: number; y: number }) => React.ReactNode; // children как функция
}

// Define the props for the component using the type
interface GraphLineProps {
  direction: LineDirection;
  length: number;
  startX: number;
  startY: number;
  color: string;
  onLineEnd: (endX: number, endY: number) => void;
}

const GraphLine: React.FC<GraphLineProps> = ({
  direction,
  length,
  startX,
  startY,
  onLineEnd,
  color,
}) => {
  const lineHeight = 2;

  // Calculate end position based on direction
  const getEndPosition = () => {
    switch (direction) {
      case "down":
        return { endX: startX, endY: startY + length };
      case "down-right":
        return { endX: startX + length, endY: startY + length };
      case "down-left":
        return { endX: startX - length, endY: startY + length };
      case "up":
        return { endX: startX, endY: startY - length };
      case "up-right":
        return { endX: startX + length, endY: startY - length };
      case "up-left":
        return { endX: startX - length, endY: startY - length };
      case "right":
        return { endX: startX + length, endY: startY };
      case "left":
        return { endX: startX - length, endY: startY };
      default:
        return { endX: startX, endY: startY + length };
    }
  };

  const { endX, endY } = getEndPosition();

  // Calculate line style based on direction
  const getLineStyle = (color: string): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      backgroundColor: color,
      transformOrigin: "left center",
    };

    const diagonalLength = Math.sqrt(length * length * 2) + "px";

    switch (direction) {
      case "down":
        return {
          ...baseStyle,
          left: startX - lineHeight / 2,
          top: startY,
          width: lineHeight + "px",
          height: length + "px",
          transform: "none",
        };
      case "up":
        return {
          ...baseStyle,
          left: startX - lineHeight / 2,
          top: startY - length,
          width: lineHeight + "px",
          height: length + "px",
          transform: "none",
        };
      case "down-right":
        return {
          ...baseStyle,
          left: startX,
          top: startY,
          width: diagonalLength,
          height: lineHeight + "px",
          transform: `rotate(45deg)`,
        };
      case "down-left":
        return {
          ...baseStyle,
          left: startX - length,
          top: startY + length,
          width: diagonalLength,
          height: lineHeight + "px",
          transform: `rotate(-45deg)`,
        };
      case "up-right":
        return {
          ...baseStyle,
          left: startX,
          top: startY,
          width: diagonalLength,
          height: lineHeight + "px",
          transform: `rotate(-45deg)`,
        };
      case "up-left":
        return {
          ...baseStyle,
          left: startX - length,
          top: startY,
          width: diagonalLength,
          height: lineHeight + "px",
          transform: `rotate(45deg)`,
        };
      case "right":
        return {
          ...baseStyle,
          left: startX,
          top: startY - lineHeight / 2,
          width: length + "px",
          height: lineHeight + "px",
          transform: "none",
        };
      case "left":
        return {
          ...baseStyle,
          left: startX - length,
          top: startY - lineHeight / 2,
          width: length + "px",
          height: lineHeight + "px",
          transform: "none",
        };
      default:
        return {
          ...baseStyle,
          left: startX - lineHeight / 2,
          top: startY,
          width: lineHeight + "px",
          height: length + "px",
          transform: "none",
        };
    }
  };

  useEffect(() => {
    onLineEnd(endX, endY);
  }, [endX, endY, onLineEnd]);

  return <div style={getLineStyle(color)} />;
};

// Component for horizontal branch (90 degrees)
interface BranchProps {
  startX: number;
  startY: number;
  side: "left" | "right";
  color: string;
  length: number;
  children?: (props: { x: number; y: number }) => React.ReactNode;
}

const Branch: React.FC<BranchProps> = ({
  startX,
  startY,
  side,
  color = "black",
  length,
  children,
}) => {
  const branchEndX = side === "right" ? startX + length : startX - length;
  const branchEndY = startY;

  const curvedPartWidth = 17; // ширина изогнутой части из SVG
  const straightLineLength = Math.max(0, length - curvedPartWidth);
  const asd = 10.567 * (side === "right" ? -1 : 1);

  const branchStyle: React.CSSProperties = {
    position: "absolute",
    top: startY - 11, // центрируем по высоте SVG
    left: side === "right" ? startX + asd : startX - length + asd,
    width: length + "px",
    height: "22px",
    display: "flex",
    flexDirection: side === "right" ? "row" : "row-reverse",
  };

  return (
    <>
      <div style={branchStyle}>
        {/* Изогнутая часть */}
        <div
          style={{
            position: "relative",
            transform: side === "left" ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            {/* Увеличил радиус круга с 4 до 5 */}
            <circle cx="10.5674" cy="10.5676" r="5" fill={color} />

            <path
              d="M17.6436 13.7292C16.9122 15.3662 15.6358 16.699 14.0318 17.5004C12.4279 18.3018 10.5957 18.5223 8.84745 18.1242C7.09918 17.7262 5.54301 16.7343 4.44408 15.3176C3.34516 13.9008 2.77147 12.1468 2.82078 10.3545C2.87008 8.56217 3.53933 6.84239 4.71448 5.48818C5.88963 4.13397 7.49798 3.22913 9.26549 2.92782C11.033 2.62651 12.8503 2.94738 14.4077 3.83576C15.9652 4.72414 17.1664 6.12506 17.8068 7.79982"
              stroke={color}
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Прямая линия (растягиваемая) */}
        {straightLineLength > 0 && (
          <div
            style={{
              position: "absolute",
              left: -asd,
              width: length,
              height: "1px",
              backgroundColor: color,
              alignSelf: "center",
              margin: "0 0.5px",
            }}
          />
        )}
      </div>
      {children && children({ x: branchEndX, y: branchEndY })}
    </>
  );
};

// Recursive component to render the sequence with branches
interface GraphSequenceProps {
  sequence: GraphNode[];
  currentIndex: number;
  startX: number;
  startY: number;
  baseLength?: number;
}

export const GraphSequence: React.FC<GraphSequenceProps> = ({
  sequence,
  currentIndex,
  startX,
  startY,
  baseLength = 160,
}) => {
  const [endX, setEndX] = useState(startX);
  const [endY, setEndY] = useState(startY);

  const handleLineEnd = (x: number, y: number) => {
    setEndX(x);
    setEndY(y);
  };

  if (currentIndex >= sequence.length) {
    return null;
  }

  const currentNode = sequence[currentIndex];

  const getSegmentLength = (): number => {
    return currentNode.length || baseLength;
  };

  const getBranchLength = (): number => {
    return currentNode.branchLength || Math.floor(80 + Math.random() * 80);
  };

  const segmentLength = getSegmentLength();
  const branchLength = getBranchLength();

  return (
    <>
      <GraphLine
        direction={currentNode.direction}
        length={segmentLength}
        startX={startX}
        startY={startY}
        color="white"
        onLineEnd={handleLineEnd}
      />

      {currentNode.hasBranch && (
        <Branch
          startX={endX}
          startY={endY}
          side={currentNode.branchSide!}
          length={branchLength}
          color={"white"}
        >
          {currentNode.children}
        </Branch>
      )}

      <GraphSequence
        sequence={sequence}
        currentIndex={currentIndex + 1}
        startX={endX}
        startY={endY}
        baseLength={baseLength}
      />
    </>
  );
};
