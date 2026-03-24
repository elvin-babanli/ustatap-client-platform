/**
 * Simple auth store with localStorage persistence.
 * Client-side only.
 */

const STORAGE_KEY = "ustatap_auth";

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

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

type Listener = (state: AuthState) => void;

let state: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
};

const listeners = new Set<Listener>();

function loadFromStorage(): AuthState {
  if (typeof window === "undefined") return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed.accessToken && parsed.refreshToken) {
        return {
          user: parsed.user ?? null,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        };
      }
    }
  } catch {
    // ignore
  }
  return { user: null, accessToken: null, refreshToken: null };
}

function saveToStorage(s: AuthState) {
  if (typeof window === "undefined") return;
  try {
    if (s.accessToken && s.refreshToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

function notify() {
  listeners.forEach((fn) => fn(state));
}

export function getAuthState(): AuthState {
  if (typeof window !== "undefined" && !state.accessToken) {
    state = loadFromStorage();
  }
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAuth(user: AuthUser, accessToken: string, refreshToken: string) {
  state = { user, accessToken, refreshToken };
  saveToStorage(state);
  notify();
}

export function setUser(user: AuthUser) {
  state = { ...state, user };
  saveToStorage(state);
  notify();
}

export function clearAuth() {
  state = { user: null, accessToken: null, refreshToken: null };
  saveToStorage(state);
  notify();
}

export function getAccessToken(): string | null {
  return getAuthState().accessToken;
}

export function getRefreshToken(): string | null {
  return getAuthState().refreshToken;
}
