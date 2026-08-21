"use client";

import { useCallback, useState } from "react";

import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

interface Review {
  _id: string;
  user: { _id: string; fullName: string } | string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

interface ReviewsSectionProps {
  productId: string;
  currentUserId?: string;
  isLoggedIn?: boolean;
  initialReviews: Review[];
  initialStats: RatingStats;
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-3 text-right text-muted-foreground">{stars}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-amber-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

export default function ReviewsSection({
  productId,
  currentUserId,
  isLoggedIn,
  initialReviews,
  initialStats,
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [stats, setStats] = useState<RatingStats>(initialStats);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch {}
  }, [productId]);

  return (
    <div className="mt-12 space-y-8">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground">Customer Reviews</h2>

        <div className="mt-6 grid gap-8 sm:grid-cols-[180px_1fr]">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{stats.average.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">
              <StarRating rating={stats.average} size="md" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.total} {stats.total === 1 ? "review" : "reviews"}
            </p>
          </div>

          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingBar
                key={stars}
                stars={stars}
                count={stats.distribution[stars] || 0}
                total={stats.total}
              />
            ))}
          </div>
        </div>
      </div>

      {isLoggedIn && (
        <ReviewForm
          productId={productId}
          onReviewSubmitted={refresh}
        />
      )}

      <ReviewList
        reviews={reviews}
        currentUserId={currentUserId}
        productId={productId}
        onReviewDeleted={refresh}
      />
    </div>
  );
}
