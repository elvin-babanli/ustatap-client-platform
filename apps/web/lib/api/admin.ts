/**
 * Admin API client
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/admin${path}`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface MasterVerificationsQuery {
  page?: number;
  limit?: number;
  verificationStatus?: string;
  masterProfileId?: string;
  search?: string;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export async function getMasterVerifications(
  accessToken: string,
  query?: MasterVerificationsQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.verificationStatus) params.set("verificationStatus", query.verificationStatus);
  if (query?.masterProfileId) params.set("masterProfileId", query.masterProfileId);
  if (query?.search) params.set("search", query.search);
  const qs = params.toString();
  const res = await fetch(getUrl(`/master-verifications${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch verifications");
  return res.json();
}

export async function getMasterVerificationById(
  accessToken: string,
  masterProfileId: string
) {
  const res = await fetch(getUrl(`/master-verifications/${masterProfileId}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Verification not found");
  return res.json();
}

export async function updateMasterVerificationStatus(
  accessToken: string,
  masterProfileId: string,
  status: string,
  rejectionReason?: string
) {
  const res = await fetch(
    getUrl(`/master-verifications/${masterProfileId}/status`),
    {
      method: "PATCH",
      headers: {
        ...authHeaders(accessToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, rejectionReason }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to update status");
  }
  return res.json();
}

export async function getUsersAdmin(
  accessToken: string,
  query?: UsersQuery
) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.role) params.set("role", query.role);
  if (query?.status) params.set("status", query.status);
  if (query?.search) params.set("search", query.search);
  const qs = params.toString();
  const res = await fetch(getUrl(`/users${qs ? `?${qs}` : ""}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function updateUserStatus(
  accessToken: string,
  userId: string,
  status: string
) {
  const res = await fetch(getUrl(`/users/${userId}/status`), {
    method: "PATCH",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to update status");
  }
  return res.json();
}

export async function getAdminDisputes(accessToken: string) {
  const res = await fetch(getUrl("/disputes"), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch disputes");
  return res.json();
}

export async function getAdminDisputeById(accessToken: string, id: string) {
  const res = await fetch(getUrl(`/disputes/${id}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Dispute not found");
  return res.json();
}
