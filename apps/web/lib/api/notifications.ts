/**
 * Notifications API client (uses auth from store)
 */

import { apiClient } from "./client";
import { authenticatedJson } from "./request";

const getUrl = (path: string) =>
  `${apiClient.getBaseUrl()}/api/v1/notifications${path}`;

export interface NotificationsQuery {
  page?: number;
  limit?: number;
}

export async function getMyNotifications(query?: NotificationsQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return authenticatedJson<unknown>(getUrl(`/me${qs ? `?${qs}` : ""}`));
}

export async function markNotificationAsRead(notificationId: string) {
  return authenticatedJson<unknown>(getUrl(`/me/${notificationId}/read`), {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead() {
  return authenticatedJson<unknown>(getUrl("/me/read-all"), {
    method: "PATCH",
  });
}

export async function getUnreadNotificationCount() {
  return authenticatedJson<unknown>(getUrl("/me/unread-count"));
}
