// components/PlayerCardSection.tsx
"use client";

import Image from "next/image";
import Intersect from "./Intersect.svg";
import Arrow from "./arror.svg";

export const PlayerCardSection = ({ playerId }: { playerId: number }) => {
  const data = {
    id: 123,
    name: "user",
  };
  return (
    <div className="flex min-w-5xl mx-auto items-center gap-6 p-4 rounded-lg h-48 ">
      {/* Левая часть */}

      <div className="flex-1 flex items-center gap-4 relative h-full p-8">
        {[
          { angle: 0, position: "top-0 left-0" }, // верхний левый
          { angle: 90, position: "top-0 right-0" }, // верхний правый
          { angle: 180, position: "bottom-0 right-0" }, // нижний правый
          { angle: 270, position: "bottom-0 left-0" }, // нижний левый
        ].map(({ angle, position }) => (
          <Image
            src={Arrow}
            alt="Arrow"
            key={`arrow-${angle}`}
            className={`absolute transform ${position}`}
            style={{
              transform: `rotate(${angle}deg)`,
            }}
            width={16}
            height={16}
          />
        ))}
        <div className="rounded-full h-20 w-20 bg-slate-800 flex-shrink-0"></div>
        <div className="flex-1 grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-xs">PLAYER</p>
            <p className="text-white text-lg">{playerId}</p>
            <div className="flex items-start gap-1 mt-1">
              <Image src={Intersect} width={48} height={48} alt="" />
              <p className="text-gray-300 text-sm top">#{playerId}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">UL RATING</p>
            <p className="text-white text-lg">84</p>
            <p className="text-gray-400 text-xs mt-1">FaceitELO</p>
            <p className="text-white text-lg">2342</p>
          </div>
        </div>
      </div>

      {/* Правая часть */}
      <div className="w-64 p-4 rounded relative h-full">
        {[
          { angle: 0, position: "top-0 left-0" }, // верхний левый
          { angle: 90, position: "top-0 right-0" }, // верхний правый
          { angle: 180, position: "bottom-0 right-0" }, // нижний правый
          { angle: 270, position: "bottom-0 left-0" }, // нижний левый
        ].map(({ angle, position }) => (
          <Image
            src={Arrow}
            alt="Arrow"
            key={`arrow-${angle}`}
            className={`absolute transform ${position}`}
            style={{
              transform: `rotate(${angle}deg)`,
            }}
            width={16}
            height={16}
          />
        ))}

        <h3 className="text-white text-center text-sm mb-2">UMC</h3>
        <div className="flex justify-center gap-1 mb-3">
          {[34, 35, 36, 37].map((n) => (
            <div
              key={n}
              className="bg-white text-black w-6 h-6 text-xs flex items-center justify-center"
            >
              {n}
            </div>
          ))}
        </div>
        {["ULTournaments", "MVP", "Captain"].map((label, i) => (
          <div key={label} className="flex justify-between text-xs py-1">
            <span className="text-gray-300">{label}</span>
            <span className="text-white font-medium">{[34, 5, 5][i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
