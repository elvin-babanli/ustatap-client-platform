/**
 * API client base and authenticated request utilities.
 */

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function createApiClient() {
  return {
    getBaseUrl: () => getBaseUrl(),
  };
}

export const apiClient = createApiClient();

export { authenticatedFetch, authenticatedJson, ApiError } from "./request";
