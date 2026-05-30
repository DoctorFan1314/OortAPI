"use client";

import { useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useI18n } from "@/contexts/i18n-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  useEffect(() => {
    document.title = `${t.dashboard.title} — OortAPI`;
  }, [t.dashboard.title]);

  return (
    <AuthGuard>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 animate-page-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />
          <main id="main-content" className="flex-1 min-w-0">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
