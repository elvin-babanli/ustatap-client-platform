/**
 * Auth API client.
 * Login/register use plain fetch. getMe uses authenticated fetch.
 */

import { apiClient } from "./client";
import { parseApiError, getErrorMessage } from "./errors";
import { authenticatedJson } from "./request";

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

export type RegisterRole = "CUSTOMER" | "MASTER";

export interface RegisterData {
  role?: RegisterRole;
  email?: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  bio?: string;
  experienceYears?: number;
  categoryId?: string;
  startingPrice?: number;
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
 * Get current user - uses token from auth store
 */
export async function getMe() {
  return authenticatedJson<AuthResponse["user"]>(`${getAuthBaseUrl()}/me`);
}

/**
 * Forgot password - sends reset code (dev: logs code)
 */
export async function forgotPassword(identifier: string): Promise<{ message: string }> {
  const res = await fetch(`${getAuthBaseUrl()}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

/**
 * Verify reset code before showing new password form
 */
export async function verifyResetCode(
  identifier: string,
  code: string,
): Promise<{ valid: boolean }> {
  const res = await fetch(`${getAuthBaseUrl()}/verify-reset-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, code }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
  return res.json();
}

/**
 * Reset password with code
 */
export async function resetPassword(
  identifier: string,
  code: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${getAuthBaseUrl()}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, code, newPassword }),
  });
  if (!res.ok) {
    const envelope = await parseApiError(res);
    throw new Error(getErrorMessage(envelope));
  }
}
