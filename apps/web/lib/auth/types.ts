/**
 * Auth types - future token store / auth state
 */

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string;
  role: string;
  status: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
