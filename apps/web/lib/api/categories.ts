/**
 * Categories API client
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/categories${path}`;

export interface Category {
  id: string;
  nameAz: string;
  nameEn: string;
  nameRu: string;
  slug: string;
  descriptionAz?: string;
  descriptionEn?: string;
  descriptionRu?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(getUrl(""));
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getCategoryBySlug(slug: string): Promise<Category & { serviceCount?: number }> {
  const res = await fetch(getUrl(`/${slug}`));
  if (!res.ok) throw new Error("Category not found");
  return res.json();
}
