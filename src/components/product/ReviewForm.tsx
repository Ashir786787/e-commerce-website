"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import InteractiveStarRating from "./InteractiveStarRating";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({
  productId,
  orderId,
  onReviewSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title,
          comment,
          orderId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        return;
      }

      toast.success("Review submitted successfully!");
      setRating(0);
      setTitle("");
      setComment("");
      onReviewSubmitted();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">Write a Review</h3>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Your Rating
          </label>
          <InteractiveStarRating value={rating} onChange={setRating} />
        </div>

        <div>
          <label htmlFor="review-title" className="mb-1.5 block text-sm font-medium text-foreground">
            Title
          </label>
          <input
            id="review-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            required
            className="w-full rounded-xl border bg-muted/30 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="review-comment" className="mb-1.5 block text-sm font-medium text-foreground">
            Your Review
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience with this product..."
            rows={4}
            required
            className="w-full resize-none rounded-xl border bg-muted/30 px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
