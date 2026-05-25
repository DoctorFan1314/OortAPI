"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
  createdAt?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"], duration?: number) => void;
  toastWithAction: (message: string, action: ToastAction, type?: Toast["type"], duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info", action?: ToastAction, duration?: number) => {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      const now = Date.now();
      const autoDismiss = duration ?? (type === "error" ? 5000 : 3000);

      setToasts((prev) => {
        const recentDuplicate = prev.some((t) => t.message === message && t.createdAt && now - t.createdAt < 500);
        if (recentDuplicate) return prev;
        const next = [...prev, { id, message, type, createdAt: now, action }];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });

      const timeout = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        timeoutsRef.current.delete(id);
      }, autoDismiss);
      timeoutsRef.current.set(id, timeout);
    },
    [],
  );

  const toast = useCallback(
    (message: string, type?: Toast["type"], duration?: number) => addToast(message, type, undefined, duration),
    [addToast],
  );

  const toastWithAction = useCallback(
    (message: string, action: ToastAction, type?: Toast["type"], duration?: number) => addToast(message, type, action, duration),
    [addToast],
  );

  const dismiss = useCallback(
    (id: string) => {
      const timeout = timeoutsRef.current.get(id);
      if (timeout) {
        clearTimeout(timeout);
        timeoutsRef.current.delete(id);
      }
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [],
  );

  const value = useMemo(() => ({ toasts, toast, toastWithAction, dismiss }), [toasts, toast, toastWithAction, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
