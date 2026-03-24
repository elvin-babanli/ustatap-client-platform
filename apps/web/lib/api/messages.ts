/**
 * Messages API client - booking-based conversations
 */

import { apiClient } from "./client";
import { authenticatedJson } from "./request";

const getBase = () => `${apiClient.getBaseUrl()}/api/v1/messages`;

export async function getThreads() {
  return authenticatedJson(getBase() + "/threads");
}

export async function getThreadByBooking(bookingId: string) {
  return authenticatedJson(getBase() + `/threads/by-booking/${bookingId}`);
}

export async function getThreadById(threadId: string) {
  return authenticatedJson(getBase() + `/threads/${threadId}`);
}

export async function createThread(bookingId: string) {
  return authenticatedJson(getBase() + "/threads", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function sendMessage(threadId: string, content: string) {
  return authenticatedJson(getBase() + `/threads/${threadId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
