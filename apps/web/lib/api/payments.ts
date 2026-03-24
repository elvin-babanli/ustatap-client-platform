/**
 * Payments API client (uses auth from store).
 * Supports Idempotency-Key header for payment initiation.
 */

import { apiClient } from "./client";
import { parseApiError, getErrorMessage } from "./errors";
import { authenticatedFetch } from "./request";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/payments${path}`;

export interface InitiateBookingPaymentData {
  method: "CARD" | "BANK_TRANSFER" | "CASH" | "WALLET" | "OTHER";
  idempotencyKey?: string;
}

export interface PaymentsQuery {
  page?: number;
  limit?: number;
  status?: string;
  bookingId?: string;
}

export interface PayoutsQuery {
  page?: number;
  limit?: number;
  status?: string;
}

export interface AdminPaymentsQuery extends PaymentsQuery {
  payerUserId?: string;
  provider?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminPayoutsQuery extends PayoutsQuery {
  masterProfileId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePayoutData {
  masterProfileId: string;
  amount: number;
  currency: "AZN" | "USD" | "EUR" | "RUB";
  reference?: string;
  notes?: string;
}

export async function initiateBookingPayment(
  bookingId: string,
  data: InitiateBookingPaymentData,
  idempotencyKey?: string
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await authenticatedFetch(getUrl(`/bookings/${bookingId}/initiate`), {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getMyPayments(query?: PaymentsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.bookingId) params.set("bookingId", query.bookingId);
  const qs = params.toString();
  const res = await authenticatedFetch(getUrl(`/me${qs ? `?${qs}` : ""}`));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getMyPaymentById(id: string) {
  const res = await authenticatedFetch(getUrl(`/me/${id}`));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getMyPayouts(query?: PayoutsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  const res = await authenticatedFetch(getUrl(`/master/payouts/me${qs ? `?${qs}` : ""}`));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getMyPayoutSummary() {
  const res = await authenticatedFetch(getUrl("/master/payouts/me/summary"));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getAdminPayments(query?: AdminPaymentsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.bookingId) params.set("bookingId", query.bookingId);
  if (query?.payerUserId) params.set("payerUserId", query.payerUserId);
  if (query?.provider) params.set("provider", query.provider);
  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  const qs = params.toString();
  const res = await authenticatedFetch(getUrl(`/admin${qs ? `?${qs}` : ""}`));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getAdminPaymentById(id: string) {
  const res = await authenticatedFetch(getUrl(`/admin/${id}`));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function updateAdminPaymentStatus(
  id: string,
  status: string,
  failureReason?: string
) {
  const res = await authenticatedFetch(getUrl(`/admin/${id}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, failureReason }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getAdminPayouts(query?: AdminPayoutsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.masterProfileId) params.set("masterProfileId", query.masterProfileId);
  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  const qs = params.toString();
  const res = await authenticatedFetch(getUrl(`/admin/payouts${qs ? `?${qs}` : ""}`));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function createAdminPayout(data: CreatePayoutData) {
  const res = await authenticatedFetch(getUrl("/admin/payouts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function updateAdminPayoutStatus(id: string, status: string) {
  const res = await authenticatedFetch(getUrl(`/admin/payouts/${id}/status`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}
