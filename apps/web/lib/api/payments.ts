/**
 * Payments API client.
 * Supports Idempotency-Key header for payment initiation.
 */

import { apiClient } from "./client";
import { parseApiError, getErrorMessage } from "./errors";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/payments${path}`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

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
  accessToken: string,
  bookingId: string,
  data: InitiateBookingPaymentData,
  idempotencyKey?: string
) {
  const headers: Record<string, string> = {
    ...authHeaders(accessToken),
    "Content-Type": "application/json",
  };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  const res = await fetch(getUrl(`/bookings/${bookingId}/initiate`), {
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

export async function getMyPayments(
  accessToken: string,
  query?: PaymentsQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.bookingId) params.set("bookingId", query.bookingId);
  const qs = params.toString();
  const res = await fetch(getUrl(`/me${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function getMyPaymentById(
  accessToken: string,
  id: string
) {
  const res = await fetch(getUrl(`/me/${id}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Payment not found");
  return res.json();
}

export async function getMyPayouts(
  accessToken: string,
  query?: PayoutsQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  const res = await fetch(getUrl(`/master/payouts/me${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch payouts");
  return res.json();
}

export async function getMyPayoutSummary(accessToken: string) {
  const res = await fetch(getUrl("/master/payouts/me/summary"), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch payout summary");
  return res.json();
}

export async function getAdminPayments(
  accessToken: string,
  query?: AdminPaymentsQuery
) {
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
  const res = await fetch(getUrl(`/admin${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function getAdminPaymentById(
  accessToken: string,
  id: string
) {
  const res = await fetch(getUrl(`/admin/${id}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Payment not found");
  return res.json();
}

export async function updateAdminPaymentStatus(
  accessToken: string,
  id: string,
  status: string,
  failureReason?: string
) {
  const res = await fetch(getUrl(`/admin/${id}/status`), {
    method: "PATCH",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, failureReason }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function getAdminPayouts(
  accessToken: string,
  query?: AdminPayoutsQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.status) params.set("status", query.status);
  if (query?.masterProfileId) params.set("masterProfileId", query.masterProfileId);
  if (query?.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query?.dateTo) params.set("dateTo", query.dateTo);
  const qs = params.toString();
  const res = await fetch(getUrl(`/admin/payouts${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch payouts");
  return res.json();
}

export async function createAdminPayout(
  accessToken: string,
  data: CreatePayoutData
) {
  const res = await fetch(getUrl("/admin/payouts"), {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

export async function updateAdminPayoutStatus(
  accessToken: string,
  id: string,
  status: string
) {
  const res = await fetch(getUrl(`/admin/payouts/${id}/status`), {
    method: "PATCH",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}
