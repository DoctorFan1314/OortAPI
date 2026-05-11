"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";

// Module-level guest ID, shared across all useUserLocalStorage instances in the same tab.
// Each tab gets its own unique guest ID so different tabs don't collide.
// Lazy-initialized to avoid SSR crash on Node < 19 where crypto.randomUUID may not exist.
let _guestId: string | null = null;
function getGuestId(): string {
  if (typeof window === "undefined") return "ssr-guest";
  if (!_guestId) _guestId = crypto.randomUUID();
  return _guestId;
}

export function useUserLocalStorage<T>(key: string, initialValue: T, serialize = JSON.stringify, deserialize = JSON.parse) {
  const { user } = useAuth();
  const userKey = user ? `${key}-${user.email}` : `${key}-guest-${getGuestId()}`;
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  // Ref for initialValue so cross-tab sync effect doesn't re-subscribe on every render
  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  // Ref for deserialize to avoid re-triggering useEffect when caller passes inline function
  const deserializeRef = useRef(deserialize);
  deserializeRef.current = deserialize;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(userKey);
      if (raw !== null) {
        setValue(deserializeRef.current(raw));
      } else {
        setValue(initialValueRef.current);
      }
    } catch {
      setValue(initialValueRef.current);
    }
    setLoaded(true);
  }, [userKey]);

  const set = useCallback((updater: T | ((prev: T) => T)): boolean => {
    let success = true;
    setValue(prev => {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(prev) : updater;
      try {
        localStorage.setItem(userKey, serialize(next));
      } catch (err) {
        success = false;
        if (err instanceof DOMException && err.name === "QuotaExceededError") {
          console.warn(`[useUserLocalStorage] Quota exceeded for key "${userKey}".`);
        }
      }
      return next;
    });
    return success;
  }, [userKey, serialize]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(userKey);
    } catch { /* ignore */ }
    setValue(initialValueRef.current);
  }, [userKey]);

  // Cross-tab sync
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === userKey) {
        try {
          setValue(e.newValue !== null ? deserializeRef.current(e.newValue) : initialValueRef.current);
        } catch {
          setValue(initialValueRef.current);
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [userKey]);

  return { value, set, remove, loaded };
}
