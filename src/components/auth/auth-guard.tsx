"use client";

import { useEffect, Component, type ReactNode, type ErrorInfo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("AuthGuard error:", error, info); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loaded && !user) {
      router.push("/login");
    }
  }, [loaded, user, router]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20">
        <div className="animate-pulse space-y-6">
          <div className="h-24 bg-secondary rounded-xl" />
          <div className="h-8 w-48 bg-secondary rounded" />
          <div className="h-64 bg-secondary rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <ErrorBoundary fallback={
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Something went wrong. Please try refreshing the page.</p>
        <p className="text-muted-foreground text-sm mt-1">出了点问题，请刷新页面重试。</p>
      </div>
    }>
      {children}
    </ErrorBoundary>
  );
}
