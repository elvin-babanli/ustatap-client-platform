/**
 * Masters (public listing) API client
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/masters${path}`;

export interface MastersQuery {
  city?: string;
  serviceSlug?: string;
  categorySlug?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "averageRating" | "completedJobsCount";
  sortOrder?: "asc" | "desc";
}

export interface MasterServiceSummary {
  id: string;
  basePrice: number;
  currency: string;
  service: { id: string; nameEn: string; nameAz?: string; nameRu?: string };
}

export interface MasterSummary {
  id: string;
  displayName: string;
  bio?: string;
  experienceYears?: number;
  avatarUrl?: string;
  averageRating: number;
  totalReviews: number;
  completedJobsCount: number;
  isAvailable: boolean;
  verificationStatus: string;
  createdAt: string;
  masterServices?: MasterServiceSummary[];
  serviceAreas?: { city: string; district?: string }[];
}

export interface PaginatedMasters {
  items: MasterSummary[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getMasters(
  query?: MastersQuery
): Promise<PaginatedMasters> {
  const params = new URLSearchParams();
  if (query?.city) params.set("city", query.city);
  if (query?.serviceSlug) params.set("serviceSlug", query.serviceSlug);
  if (query?.categorySlug) params.set("categorySlug", query.categorySlug);
  if (query?.isAvailable !== undefined) params.set("isAvailable", String(query.isAvailable));
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  const res = await fetch(getUrl(qs ? `?${qs}` : ""));
  if (!res.ok) throw new Error("Failed to fetch masters");
  return res.json();
}

export async function getMasterById(id: string): Promise<MasterSummary> {
  const res = await fetch(getUrl(`/${id}`));
  if (!res.ok) throw new Error("Master not found");
  return res.json();
}
