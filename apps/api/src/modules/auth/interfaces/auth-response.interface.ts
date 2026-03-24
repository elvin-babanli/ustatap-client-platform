export interface SafeUser {
  id: string;
  email: string | null;
  phone: string;
  role: string;
  status: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SafeUser;
}
