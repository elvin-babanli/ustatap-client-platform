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
  sortBy?: "createdAt" | "averageRating" | "completedJobsCount" | "recommended" | "priceAsc" | "ratingDesc" | "nearest" | "fastestArrival";
  sortOrder?: "asc" | "desc";
  /** Server-side filter: price range */
  priceMin?: number;
  priceMax?: number;
  /** Server-side filter: minimum rating */
  minRating?: number;
  /** Server-side filter: verified masters only */
  verifiedOnly?: boolean;
  /** Placeholder; backend may ignore if no data */
  urgentAvailable?: boolean;
  language?: string;
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
  if (query?.priceMin != null) params.set("priceMin", String(query.priceMin));
  if (query?.priceMax != null) params.set("priceMax", String(query.priceMax));
  if (query?.minRating != null) params.set("minRating", String(query.minRating));
  if (query?.verifiedOnly) params.set("verifiedOnly", "true");
  if (query?.urgentAvailable) params.set("urgentAvailable", "true");
  if (query?.language) params.set("language", query.language);
  const qs = params.toString();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(getUrl(qs ? `?${qs}` : ""), {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error("Failed to fetch masters");
    const data = (await res.json()) as unknown;
    if (!data || typeof data !== "object" || !Array.isArray((data as PaginatedMasters).items)) {
      return {
        items: [],
        meta: { page: 1, limit: query?.limit ?? 0, total: 0, totalPages: 0 },
      };
    }
    return data as PaginatedMasters;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getMasterById(id: string): Promise<MasterSummary> {
  const res = await fetch(getUrl(`/${id}`));
  if (!res.ok) throw new Error("Master not found");
  return res.json();
}
