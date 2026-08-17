"use client";

import { useState } from "react";
import { BadgeCheck, Trash2, Edit3 } from "lucide-react";
import { toast } from "sonner";

import StarRating from "./StarRating";
import InteractiveStarRating from "./InteractiveStarRating";

interface Review {
  _id: string;
  user: { _id: string; fullName: string } | string;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
  productId: string;
  onReviewDeleted: () => void;
}

export default function ReviewList({
  reviews,
  currentUserId,
  productId,
  onReviewDeleted,
}: ReviewListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [saving, setSaving] = useState(false);

  function getUserName(review: Review) {
    if (typeof review.user === "string") return "Anonymous";
    return review.user.fullName || "Anonymous";
  }

  function getUserId(review: Review) {
    if (typeof review.user === "string") return review.user;
    return review.user._id;
  }

  async function handleDelete(reviewId: string) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(`/api/reviews/${productId}/${reviewId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete review");
        return;
      }

      toast.success("Review deleted");
      onReviewDeleted();
    } catch {
      toast.error("Failed to delete review");
    }
  }

  function startEditing(review: Review) {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditComment(review.comment);
  }

  async function handleEdit(reviewId: string) {
    setSaving(true);

    try {
      const res = await fetch(`/api/reviews/${productId}/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: editRating,
          title: editTitle,
          comment: editComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update review");
        return;
      }

      toast.success("Review updated");
      setEditingId(null);
      onReviewDeleted();
    } catch {
      toast.error("Failed to update review");
    } finally {
      setSaving(false);
    }
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center">
        <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const isOwner = currentUserId === getUserId(review);

        if (editingId === review._id) {
          return (
            <div key={review._id} className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <InteractiveStarRating
                  value={editRating}
                  onChange={setEditRating}
                  size="sm"
                />
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-3 w-full rounded-xl border bg-muted/30 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border bg-muted/30 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => handleEdit(review._id)}
                disabled={saving}
                className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          );
        }

        return (
          <div key={review._id} className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  {review.isVerifiedPurchase && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <BadgeCheck className="h-3 w-3" />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h4 className="mt-2 font-semibold text-foreground">{review.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  by {getUserName(review)} &middot;{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-PK", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditing(review)}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(review._id)}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {review.comment}
            </p>
          </div>
        );
      })}
    </div>
  );
}
