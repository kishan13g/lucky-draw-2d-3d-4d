import { useCallback, useEffect, useState } from "react";
import type { AuthState } from "@/types";

const STORAGE_KEY = "ld_auth";

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  });

  // Keep state in sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        setAuth(e.newValue ? (JSON.parse(e.newValue) as AuthState) : null);
      } catch {
        setAuth(null);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = useCallback((mobileNumber: string, deviceToken: string) => {
    const state: AuthState = { mobileNumber, deviceToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setAuth(state);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  return { auth, login, logout };
}
