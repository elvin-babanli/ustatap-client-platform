/**
 * Dashboard API client (uses auth from store)
 */

import { apiClient } from "./client";
import { authenticatedJson } from "./request";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/dashboard${path}`;

export async function getCustomerDashboard() {
  return authenticatedJson<unknown>(getUrl("/customer"));
}

export async function getMasterDashboard() {
  return authenticatedJson<unknown>(getUrl("/master"));
}

export async function getAdminDashboard() {
  return authenticatedJson<unknown>(getUrl("/admin"));
}
