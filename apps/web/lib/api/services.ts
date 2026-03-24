/**
 * Services API client
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/services${path}`;

export interface ServicesQuery {
  categorySlug?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedServices {
  items: Service[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface Service {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  slug: string;
  descriptionAz?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  isActive: boolean;
  categoryId: string;
  category?: { id: string; nameAz: string; nameEn: string; nameRu: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

export async function getServices(
  query?: ServicesQuery
): Promise<PaginatedServices> {
  const params = new URLSearchParams();
  if (query?.categorySlug) params.set("categorySlug", query.categorySlug);
  if (query?.search) params.set("search", query.search);
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  const res = await fetch(getUrl(qs ? `?${qs}` : ""));
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

export async function getServiceBySlug(slug: string): Promise<Service> {
  const res = await fetch(getUrl(`/${slug}`));
  if (!res.ok) throw new Error("Service not found");
  return res.json();
}
