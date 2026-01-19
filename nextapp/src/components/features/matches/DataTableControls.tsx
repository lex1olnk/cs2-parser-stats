import { useEffect, useState } from "react";

interface FilterState {
  ratingRange: [number, number];
}

interface DataTableControlsProps {
  initialFilters?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
  minRating?: number;
  maxRating?: number;
  className: string;
}

export const DataTableControls = ({
  onFilterChange,
  minRating = 0,
  maxRating = 100,
  className
}: DataTableControlsProps) => {
  const [filters, setFilters] = useState<FilterState>({
    ratingRange: [minRating, maxRating],
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleRatingChange = (type: "min" | "max", value: number) => {
    setFilters((prev) => {
      const newRange: [number, number] =
        type === "min"
          ? [Math.min(value, prev.ratingRange[1]), prev.ratingRange[1]]
          : [prev.ratingRange[0], Math.max(value, prev.ratingRange[0])];

      return { ...prev, ratingRange: newRange };
    });
  };

  return (
    <div className={"controls-section" + className}>
      <h4>ULRating Filter</h4>
      <div className="range-controls">
        <input
          type="number"
          min={minRating}
          max={maxRating}
          value={filters.ratingRange[0]}
          onChange={(e) => handleRatingChange("min", Number(e.target.value))}
        />
        <span>-</span>
        <input
          type="number"
          min={minRating}
          max={maxRating}
          value={filters.ratingRange[1]}
          onChange={(e) => handleRatingChange("max", Number(e.target.value))}
        />
      </div>
    </div>
  );
};
