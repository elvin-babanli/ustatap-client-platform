/**
 * Auth-related constants
 */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid credentials",
  USER_SUSPENDED: "Account suspended",
  USER_INACTIVE: "Account inactive",
  REFRESH_TOKEN_INVALID: "Invalid or expired refresh token",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  PHONE_ALREADY_EXISTS: "Phone number already registered",
} as const;

export const AUTH_MESSAGES = {
  REGISTRATION_SUCCESS: "Registration successful",
  LOGOUT_SUCCESS: "Logged out successfully",
} as const;
