"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/contexts/auth-context";

export function useFollows() {
  const { user } = useAuth();
  const [following, setFollowing] = useState<string[]>([]);
  const followingRef = useRef<string[]>([]);
  followingRef.current = following;
  const userRef = useRef(user);
  userRef.current = user;
  const skipPersistRef = useRef(true);

  useEffect(() => {
    skipPersistRef.current = true;
    if (!user) {
      setFollowing([]);
      // Delay resetting skipPersistRef so the persist effect sees it
      requestAnimationFrame(() => { skipPersistRef.current = false; });
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.follows(user.email));
      if (raw) setFollowing(JSON.parse(raw));
      else setFollowing([]);
    } catch { setFollowing([]); }
    requestAnimationFrame(() => { skipPersistRef.current = false; });
  }, [user]);

  // Persist follows to localStorage whenever they change
  useEffect(() => {
    if (skipPersistRef.current) return;
    const u = userRef.current;
    if (!u) return;
    try {
      localStorage.setItem(STORAGE_KEYS.follows(u.email), JSON.stringify(following));
    } catch { /* ignore */ }
  }, [following]);

  // Cross-tab sync for follows
  useEffect(() => {
    if (!user) return;
    const followKey = STORAGE_KEYS.follows(user.email);
    const handler = (e: StorageEvent) => {
      if (e.key === followKey) {
        skipPersistRef.current = true;
        try {
          setFollowing(e.newValue !== null ? JSON.parse(e.newValue) : []);
        } catch {
          setFollowing([]);
        }
        // Allow persist to resume after this sync update flushes
        setTimeout(() => { skipPersistRef.current = false; }, 0);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [user]);

  const isFollowing = useCallback((author: string) => followingRef.current.includes(author), []);

  const toggleFollow = useCallback((author: string) => {
    if (!user) return;
    setFollowing(prev =>
      prev.includes(author)
        ? prev.filter(a => a !== author)
        : [...prev, author]
    );
  }, [user]);

  return { following, isFollowing, toggleFollow };
}
