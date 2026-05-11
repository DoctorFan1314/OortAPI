"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/contexts/auth-context";
import type { Notification } from "@/lib/types";

export type NotificationType = "comment_reply" | "skill_update" | "submission_status" | "like" | "follow" | "system";

const ALL_TYPES: NotificationType[] = ["comment_reply", "skill_update", "submission_status", "like", "follow", "system"];

function loadPreferences(email?: string): Record<NotificationType, boolean> {
  const key = email ? STORAGE_KEYS.notificationPrefs(email) : "ai-skills-hub-notification-prefs-guest";
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const saved = JSON.parse(raw);
      const result: Record<string, boolean> = {};
      for (const t of ALL_TYPES) {
        result[t] = saved[t] !== false; // default to true
      }
      return result as Record<NotificationType, boolean>;
    }
  } catch { /* ignore */ }
  const defaults: Record<string, boolean> = {};
  for (const t of ALL_TYPES) { defaults[t] = true; }
  return defaults as Record<NotificationType, boolean>;
}

function savePreferences(prefs: Record<NotificationType, boolean>, email?: string) {
  const key = email ? STORAGE_KEYS.notificationPrefs(email) : "ai-skills-hub-notification-prefs-guest";
  try {
    localStorage.setItem(key, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<Record<NotificationType, boolean>>(() => loadPreferences(user?.email));

  // Ref to always have the latest preferences for closures
  const prefsRef = useRef(preferences);
  prefsRef.current = preferences;

  // Ref to always have the latest user email for closures (avoids stale closures)
  const userEmailRef = useRef(user?.email);
  userEmailRef.current = user?.email;

  // Derive unreadCount from notifications using useMemo
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Load from localStorage
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.notifications(user.email));
      if (raw) {
        const parsed: Notification[] = JSON.parse(raw);
        setNotifications(parsed);
      }
    } catch { /* ignore */ }
  }, [user]);

  // Load preferences from localStorage (user-scoped) — only on user change
  useEffect(() => {
    setPreferences(loadPreferences(user?.email));
  }, [user?.email]);

  const updatePreference = useCallback((type: NotificationType, enabled: boolean) => {
    setPreferences(prev => {
      const updated = { ...prev, [type]: enabled };
      savePreferences(updated, userEmailRef.current);
      return updated;
    });
  }, []);

  const isTypeEnabled = useCallback((type: NotificationType): boolean => {
    return prefsRef.current[type] !== false;
  }, []);

  const markAsRead = useCallback((id: string) => {
    const email = userEmailRef.current;
    if (!email) return;
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEYS.notifications(email), JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    const email = userEmailRef.current;
    if (!email) return;
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEYS.notifications(email), JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    const email = userEmailRef.current;
    if (!email) return;
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEYS.notifications(email));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read" | "userId">) => {
    const email = userEmailRef.current;
    if (!email) return;
    if (!prefsRef.current[notification.type]) return;
    const newNotif: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
      userId: email,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // max 50
      localStorage.setItem(STORAGE_KEYS.notifications(email), JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { notifications, unreadCount, markAsRead, markAllRead, clearAll, addNotification, preferences, updatePreference, isTypeEnabled };
}
