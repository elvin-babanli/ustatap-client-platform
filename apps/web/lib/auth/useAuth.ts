"use client";

import { useEffect, useState } from "react";
import {
  getAuthState,
  subscribe,
  type AuthState,
  type AuthUser,
} from "./store";

export function useAuth(): AuthState & { isReady: boolean } {
  const [auth, setAuth] = useState<AuthState>(getAuthState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
    setAuth(getAuthState());
    return subscribe(setAuth);
  }, []);

  return { ...auth, isReady };
}

export function useUser(): AuthUser | null {
  return useAuth().user;
}

export function useAccessToken(): string | null {
  return useAuth().accessToken;
}

export function useIsAuthenticated(): boolean {
  const { accessToken, isReady } = useAuth();
  return isReady && Boolean(accessToken);
}
