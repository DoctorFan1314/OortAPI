"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 animate-page-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          <DashboardSidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
