"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface InteractiveStarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "h-5 w-5",
  md: "h-7 w-7",
  lg: "h-8 w-8",
};

export default function InteractiveStarRating({
  value,
  onChange,
  size = "md",
}: InteractiveStarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition hover:scale-110"
        >
          <Star
            className={`${sizeMap[size]} ${
              star <= (hover || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}
