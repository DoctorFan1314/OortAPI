"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  Zap,
  FileText,
  ThumbsUp,
  UserPlus,
  X,
  CheckCheck,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useNotifications } from "@/hooks/use-notifications";
import type { Notification } from "@/lib/types";

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "comment_reply":
      return <MessageSquare className="h-4 w-4 text-blue-400" />;
    case "skill_update":
      return <Zap className="h-4 w-4 text-primary" />;
    case "submission_status":
      return <FileText className="h-4 w-4 text-purple-400" />;
    case "like":
      return <ThumbsUp className="h-4 w-4 text-pink-400" />;
    case "follow":
      return <UserPlus className="h-4 w-4 text-green-400" />;
    case "system":
      return <Bell className="h-4 w-4 text-orange-400" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function timeAgo(dateStr: string, agoText: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${agoText}`;
  if (hours > 0) return `${hours}h ${agoText}`;
  if (minutes > 0) return `${minutes}m ${agoText}`;
  return `${agoText}`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useI18n();
  const { notifications, unreadCount, markAsRead, markAllRead, clearAll } =
    useNotifications();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return;
      const items = notifications.length;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        setActiveIdx(-1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((prev) => Math.min(prev + 1, items - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && activeIdx >= 0 && notifications[activeIdx]) {
        e.preventDefault();
        handleNotificationClick(notifications[activeIdx]);
      }
    },
    [open, notifications, activeIdx],
  );

  // Focus active item
  useEffect(() => {
    if (!open || activeIdx < 0 || !menuRef.current) return;
    const items = menuRef.current.querySelectorAll('[role="menuitem"]');
    if (activeIdx >= items.length) return;
    (items[activeIdx] as HTMLElement)?.focus();
  }, [activeIdx, open]);

  function handleNotificationClick(notification: Notification) {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
    setOpen(false);
    setActiveIdx(-1);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          setOpen(!open);
          setActiveIdx(-1);
        }}
        className="relative text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary"
        aria-label={`${t.common.notifications}${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t.common.notifications}
          onKeyDown={handleKeyDown}
          className="absolute top-full right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              {t.common.notifications}
            </h3>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
                    title={t.common.markAllRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => clearAll()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
                    title={t.common.clearAll}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  setActiveIdx(-1);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary"
                aria-label={t.common.close}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t.common.noNotifications}
                </p>
              </div>
            ) : (
              notifications.map((notification, idx) => (
                <button
                  key={notification.id}
                  role="menuitem"
                  tabIndex={idx === activeIdx ? 0 : -1}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors outline-none ${
                    idx === activeIdx ? "bg-secondary" : "hover:bg-secondary"
                  } ${!notification.read ? "bg-primary/5" : ""}`}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm truncate ${
                          notification.read
                            ? "text-muted-foreground"
                            : "text-foreground font-medium"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {timeAgo(notification.timestamp, t.common.ago)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
