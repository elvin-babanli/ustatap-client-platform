/**
 * Disputes API client
 */

import { apiClient } from "./client";
import { authenticatedJson } from "./request";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/disputes${path}`;

export type DisputeIssueType =
  | "OVERCHARGE"
  | "BAD_QUALITY"
  | "NO_SHOW"
  | "SAFETY_ISSUE"
  | "PAYMENT_ISSUE"
  | "OTHER";

export interface CreateDisputeData {
  bookingId: string;
  issueType: DisputeIssueType;
  reason: string;
  attachmentUrls?: string[];
}

export async function createDispute(data: CreateDisputeData) {
  return authenticatedJson(getUrl(""), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMyDisputes() {
  return authenticatedJson(getUrl("/me"));
}

export async function getMyDisputeById(id: string) {
  return authenticatedJson(getUrl(`/me/${id}`));
}
