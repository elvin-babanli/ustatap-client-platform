/**
 * Reviews API client
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/reviews${path}`;
const getMastersUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/masters${path}`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface CreateReviewData {
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export async function createReview(
  accessToken: string,
  data: CreateReviewData
) {
  const res = await fetch(getUrl(""), {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to create review");
  }
  return res.json();
}

export async function getMyReviews(
  accessToken: string,
  query?: ReviewsQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  const res = await fetch(getUrl(`/me${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function getMyReviewById(accessToken: string, id: string) {
  const res = await fetch(getUrl(`/me/${id}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Review not found");
  return res.json();
}

export async function updateMyReview(
  accessToken: string,
  id: string,
  data: UpdateReviewData
) {
  const res = await fetch(getUrl(`/me/${id}`), {
    method: "PATCH",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to update review");
  }
  return res.json();
}

export async function getMasterReviews(
  masterId: string,
  query?: ReviewsQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  const res = await fetch(getMastersUrl(`/${masterId}/reviews${qs ? `?${qs}` : ""}`));
  if (!res.ok) throw new Error("Failed to fetch reviews");
  return res.json();
}

export async function replyToReview(
  accessToken: string,
  reviewId: string,
  comment: string
) {
  const res = await fetch(getUrl(`/${reviewId}/reply`), {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to reply");
  }
  return res.json();
}
