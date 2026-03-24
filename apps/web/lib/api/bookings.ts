/**
 * Bookings API client
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/bookings${path}`;

export interface CreateBookingData {
  masterProfileId: string;
  masterServiceId: string;
  addressId?: string;
  address?: {
    label?: string;
    country: string;
    city: string;
    district?: string;
    street?: string;
    building?: string;
    apartment?: string;
    latitude?: number;
    longitude?: number;
    postalCode?: string;
  };
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd: string;
  problemDescription?: string;
  estimatedPrice: number;
  currency: "AZN" | "USD" | "EUR" | "RUB";
  attachments?: { fileUrl: string; fileType?: string }[];
}

export interface BookingsQuery {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "scheduledDate" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface AdminBookingsQuery extends BookingsQuery {
  customerUserId?: string;
  masterProfileId?: string;
}

import { authenticatedJson } from "./request";

export async function createBooking(data: CreateBookingData) {
  return authenticatedJson<unknown>(getUrl(""), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyBookings(query?: BookingsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return authenticatedJson<unknown>(getUrl(`/me${qs ? `?${qs}` : ""}`));
}

export async function getMyBookingById(id: string) {
  return authenticatedJson<unknown>(getUrl(`/me/${id}`));
}

export async function cancelMyBooking(id: string, reason?: string) {
  return authenticatedJson<unknown>(getUrl(`/me/${id}/cancel`), {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
}

export async function addBookingAttachments(
  id: string,
  attachments: { fileUrl: string; fileType?: string }[]
) {
  return authenticatedJson<unknown>(getUrl(`/me/${id}/attachments`), {
    method: "POST",
    body: JSON.stringify({ attachments }),
  });
}

export async function getMasterBookings(query?: BookingsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return authenticatedJson<unknown>(getUrl(`/master/me${qs ? `?${qs}` : ""}`));
}

export async function getMasterBookingById(id: string) {
  return authenticatedJson<unknown>(getUrl(`/master/me/${id}`));
}

export async function updateMasterBookingStatus(
  id: string,
  status: string,
  note?: string
) {
  return authenticatedJson<unknown>(getUrl(`/master/me/${id}/status`), {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}

export async function getAdminBookings(query?: AdminBookingsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.customerUserId) params.set("customerUserId", query.customerUserId);
  if (query?.masterProfileId) params.set("masterProfileId", query.masterProfileId);
  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  if (query?.sortBy) params.set("sortBy", query.sortBy);
  if (query?.sortOrder) params.set("sortOrder", query.sortOrder);
  const qs = params.toString();
  return authenticatedJson<unknown>(getUrl(`/admin${qs ? `?${qs}` : ""}`));
}

export async function getAdminBookingById(id: string) {
  return authenticatedJson<unknown>(getUrl(`/admin/${id}`));
}
