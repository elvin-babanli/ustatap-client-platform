"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { createReview, updateMyReview } from "@/lib/api/reviews";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  bookingId: string;
  existingReview?: { id: string; rating: number; comment?: string };
  masterName?: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReviewModal({ bookingId, existingReview, masterName, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const { accessToken } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating ?? 5);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accessToken) return;
    setSubmitting(true);
    setError("");
    try {
      if (existingReview) {
        await updateMyReview(accessToken, existingReview.id, { rating, comment });
      } else {
        await createReview(accessToken, { bookingId, rating, comment });
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg.toLowerCase().includes("edit") ? t.review.cannotEdit : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {existingReview ? t.review.editReview : t.review.leaveReview}
          {masterName && <span className="block text-sm font-normal text-gray-500 mt-1">{masterName}</span>}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.review.rating}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRating(r)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    rating >= r ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.review.comment}</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.review.comment}
              rows={3}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t.common.back}
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? t.common.loading : t.review.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
