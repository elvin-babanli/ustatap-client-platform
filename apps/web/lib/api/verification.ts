/**
 * Verification API client (Master)
 */

import { apiClient } from "./client";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/master-profile${path}`;

function authHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

export interface CreateVerificationDocumentData {
  documentType: "ID_CARD" | "PASSPORT" | "BUSINESS_LICENSE" | "OTHER";
  fileUrl: string;
  originalFileName?: string;
}

export async function getMyVerificationSummary(accessToken: string) {
  const res = await fetch(getUrl("/me/verification"), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch verification summary");
  return res.json();
}

export async function createVerificationDocument(
  accessToken: string,
  data: CreateVerificationDocumentData
) {
  const res = await fetch(getUrl("/me/verification-documents"), {
    method: "POST",
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? "Failed to create document");
  }
  return res.json();
}

export async function getMyVerificationDocuments(accessToken: string) {
  const res = await fetch(getUrl("/me/verification-documents"), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Failed to fetch documents");
  return res.json();
}

export async function getMyVerificationDocumentById(
  accessToken: string,
  id: string
) {
  const res = await fetch(getUrl(`/me/verification-documents/${id}`), {
    headers: authHeaders(accessToken),
  });
  if (!res.ok) throw new Error("Document not found");
  return res.json();
}
