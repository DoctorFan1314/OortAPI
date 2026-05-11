"use client";

import { useLocalStorage } from "./use-local-storage";
import { useAuth } from "@/contexts/auth-context";

function getGuestId(): string {
  if (typeof window === "undefined") return "ssr-guest";
  try {
    let id = sessionStorage.getItem("ai-skills-hub-guest-id");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("ai-skills-hub-guest-id", id);
    }
    return id;
  } catch {
    return "fallback-guest";
  }
}

export function useUserStorage<T>(
  keyFn: (email: string) => string,
  fallback: T
): readonly [T, (updater: T | ((prev: T) => T)) => void, boolean] {
  const { user } = useAuth();
  const key = user ? keyFn(user.email) : `ai-skills-hub-guest-${getGuestId()}`;
  return useLocalStorage<T>(key, fallback);
}
