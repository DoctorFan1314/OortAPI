"use client";
import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useAuth } from "@/contexts/auth-context";
import type { Notification } from "@/lib/types";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load from localStorage
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.notifications(user.email));
      if (raw) {
        const parsed: Notification[] = JSON.parse(raw);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    } catch { /* ignore */ }
  }, [user]);

  const markAsRead = useCallback((id: string) => {
    if (!user) return;
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem(STORAGE_KEYS.notifications(user.email), JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, [user]);

  const markAllRead = useCallback(() => {
    if (!user) return;
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEYS.notifications(user.email), JSON.stringify(updated));
      setUnreadCount(0);
      return updated;
    });
  }, [user]);

  const clearAll = useCallback(() => {
    if (!user) return;
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem(STORAGE_KEYS.notifications(user.email));
  }, [user]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read" | "userId">) => {
    if (!user) return;
    const newNotif: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      read: false,
      userId: user.email,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // max 50
      localStorage.setItem(STORAGE_KEYS.notifications(user.email), JSON.stringify(updated));
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  }, [user]);

  return { notifications, unreadCount, markAsRead, markAllRead, clearAll, addNotification };
}
