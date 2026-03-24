/**
 * Auth actions: login, logout, getCurrentUser.
 */

import { login as apiLogin, register as apiRegister, logout as apiLogout, getMe } from "../api/auth";
import { setAuth, setUser, clearAuth, getRefreshToken } from "./store";

export async function login(credentials: { email?: string; phone?: string; password: string }) {
  const res = await apiLogin(credentials);
  setAuth(res.user, res.accessToken, res.refreshToken);
  return res;
}

export async function register(data: {
  email?: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const res = await apiRegister(data);
  setAuth(res.user, res.accessToken, res.refreshToken);
  return res;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await apiLogout(refreshToken);
    } catch {
      // ignore
    }
  }
  clearAuth();
}

export async function getCurrentUser() {
  const user = await getMe();
  setUser(user);
  return user;
}
