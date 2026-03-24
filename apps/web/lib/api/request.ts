/**
 * Authenticated fetch with 401 refresh and error handling.
 * Client-side only.
 */

import { getAccessToken, getRefreshToken, setAuth, clearAuth } from "../auth";
import { refreshTokens } from "./auth";
import { parseApiError, getErrorMessage } from "./errors";

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public envelope?: { message: string; details?: unknown[] }
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function doRefresh(): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string | null; phone: string; role: string; status: string; isPhoneVerified: boolean; isEmailVerified: boolean; createdAt: string };
} | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${getBaseUrl()}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const accessToken = data.accessToken;
    const newRefreshToken = data.refreshToken;
    const meRes = await fetch(`${getBaseUrl()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const user = meRes.ok ? await meRes.json() : { id: "", email: null, phone: "", role: "", status: "", isPhoneVerified: false, isEmailVerified: false, createdAt: "" };
    return { accessToken, refreshToken: newRefreshToken, user };
  } catch {
    return null;
  }
}

export interface AuthenticatedFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Fetch with automatic Bearer token and 401 refresh.
 * On 401: tries refresh, retries once, then clears auth and throws.
 */
export async function authenticatedFetch(
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> {
  const { skipAuth, ...init } = options;
  let token = skipAuth ? null : getAccessToken();

  const doRequest = (t: string | null) => {
    const headers = new Headers(init.headers);
    if (t) headers.set("Authorization", `Bearer ${t}`);
    if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
      headers.set("Content-Type", "application/json");
    }
    return fetch(url, { ...init, headers });
  };

  let res = await doRequest(token);

  if (res.status === 401 && !skipAuth && token) {
    const refreshed = await doRefresh();
    if (refreshed) {
      setAuth(refreshed.user, refreshed.accessToken, refreshed.refreshToken);
      res = await doRequest(refreshed.accessToken);
    } else {
      clearAuth();
      const envelope = await parseApiError(res);
      throw new ApiError(getErrorMessage(envelope), 401, envelope);
    }
  }

  return res;
}

/**
 * Fetch and parse JSON. Throws ApiError on non-2xx.
 */
export async function authenticatedJson<T>(
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<T> {
  const res = await authenticatedFetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new ApiError(getErrorMessage(envelope), res.status, envelope);
  }
  return data as T;
}
