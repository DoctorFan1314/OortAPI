"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  balance: number;
  role: "user" | "admin";
  preferences: {
    theme: "dark" | "light" | "system";
    language: "zh" | "en";
  };
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  loaded: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, "username" | "avatar" | "bio" | "preferences">>) => Promise<void>;
  changePassword: (currentPw: string, newPw: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser().finally(() => setLoaded(true));
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/me", { method: "DELETE", credentials: "include" });
    } catch { /* ignore */ }
    setUser(null);
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const updateProfile = useCallback(async (data: Partial<Pick<User, "username" | "avatar" | "bio" | "preferences">>) => {
    if (!user) return;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated.user);
      } else {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Profile update failed");
      }
    } catch (e) {
      throw e instanceof Error ? e : new Error("Network error");
    }
  }, [user]);

  const changePassword = useCallback(async (currentPw: string, newPw: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Password change failed");
      }
      return true;
    } catch (e) {
      throw e instanceof Error ? e : new Error("Network error");
    }
  }, []);

  const value = useMemo(
    () => ({ user, loaded, login, register, logout, refreshUser, updateProfile, changePassword }),
    [user, loaded, login, register, logout, refreshUser, updateProfile, changePassword],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
