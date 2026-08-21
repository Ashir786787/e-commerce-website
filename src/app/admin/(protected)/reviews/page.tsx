"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Review {
  _id: string;
  product: { name: string; _id: string } | string;
  user: { fullName: string; email: string } | string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchReviews() {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/reviews");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setReviews(data.reviews);
        }
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function toggleVisibility(reviewId: string, isVisible: boolean) {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !isVisible }),
      });

      if (res.ok) {
        toast.success(isVisible ? "Review hidden" : "Review visible");
        fetchReviews();
      } else {
        toast.error("Failed to update review");
      }
    } catch {
      toast.error("Failed to update review");
    }
  }

  async function deleteReview(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Review deleted");
        fetchReviews();
      } else {
        toast.error("Failed to delete review");
      }
    } catch {
      toast.error("Failed to delete review");
    }
  }

  function getProductName(review: Review) {
    if (typeof review.product === "string") return "Unknown Product";
    return review.product.name;
  }

  function getUserName(review: Review) {
    if (typeof review.user === "string") return "Unknown";
    return review.user.fullName || "Unknown";
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="mt-2 text-muted-foreground">
          Manage customer reviews ({reviews.length} total)
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-background px-6 py-16 text-center">
          <h2 className="text-xl font-semibold">No Reviews Yet</h2>
          <p className="mt-3 text-muted-foreground">
            Reviews will appear here once customers start reviewing products.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className={`rounded-xl border bg-white p-5 shadow-sm transition ${
                !review.isVisible ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            s <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-neutral-200 text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                    {review.isVerifiedPurchase && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Verified
                      </span>
                    )}
                    {!review.isVisible && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        Hidden
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{review.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{getUserName(review)}</span>
                    <span>{getProductName(review)}</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleVisibility(review._id, review.isVisible)}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    title={review.isVisible ? "Hide review" : "Show review"}
                  >
                    {review.isVisible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteReview(review._id)}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                    title="Delete review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
