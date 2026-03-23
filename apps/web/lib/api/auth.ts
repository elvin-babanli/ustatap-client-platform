/**
 * Auth API client - future-ready for token handling.
 * Uses standard error envelope for consistent error handling.
 */

import { apiClient } from "./client";
import { parseApiError, getErrorMessage } from "./errors";

const getAuthBaseUrl = () => `${apiClient.getBaseUrl()}/api/v1/auth`;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string | null;
    phone: string;
    role: string;
    status: string;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    createdAt: string;
  };
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  email?: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Login - returns tokens and user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${getAuthBaseUrl()}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

/**
 * Register - returns tokens and user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${getAuthBaseUrl()}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

/**
 * Refresh tokens
 */
export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const res = await fetch(`${getAuthBaseUrl()}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

/**
 * Logout - revokes session
 */
export async function logout(refreshToken: string): Promise<void> {
  await fetch(`${getAuthBaseUrl()}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}

/**
 * Get current user - requires Authorization header
 */
export async function getMe(accessToken: string) {
  const res = await fetch(`${getAuthBaseUrl()}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}
