import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  count?: number;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export default function StarRating({
  rating,
  size = "md",
  showCount = false,
  count,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeMap[size]} ${
              star <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-neutral-200 text-neutral-200"
            }`}
          />
        ))}
      </div>
      <span className={`font-semibold ${size === "sm" ? "text-xs" : "text-sm"}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={`${size === "sm" ? "text-xs" : "text-sm"} text-muted-foreground`}>
          ({count} {count === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
