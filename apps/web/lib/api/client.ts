/**
 * API client base and authenticated request utilities.
 */

/**
 * Browser: public URL (user's machine). Server (Docker SSR): service hostname `api`.
 */
const getBaseUrl = () => {
  const publicUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL ?? publicUrl;
  }
  return publicUrl;
};

export function createApiClient() {
  return {
    getBaseUrl: () => getBaseUrl(),
  };
}

export const apiClient = createApiClient();

export { authenticatedFetch, authenticatedJson, ApiError } from "./request";
