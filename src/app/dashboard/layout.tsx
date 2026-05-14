"use client";

import { useI18n } from "@/contexts/i18n-context";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { CurrencyProvider } from "@/contexts/currency-context";
import { Breadcrumb } from "@/components/shared/breadcrumb";

const ROUTE_LABELS: Record<string, { zh: string; en: string }> = {
  dashboard: { zh: "控制台", en: "Dashboard" },
  keys: { zh: "API Keys", en: "API Keys" },
  usage: { zh: "调用日志", en: "Call Logs" },
  billing: { zh: "账单中心", en: "Billing" },
  channels: { zh: "渠道管理", en: "Channels" },
  multiplier: { zh: "倍率管理", en: "Multipliers" },
  users: { zh: "用户管理", en: "Users" },
  redeem: { zh: "兑换码", en: "Redeem Codes" },
  settings: { zh: "设置", en: "Settings" },
  models: { zh: "模型市场", en: "Models" },
  admin: { zh: "管理", en: "Admin" },
  plans: { zh: "套餐管理", en: "Plans" },
  "token-plan": { zh: "我的订阅", en: "My Subscription" },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments
    .map((seg, i) => {
      if (seg === "dashboard" && i === 0) return null; // skip root
      const label = ROUTE_LABELS[seg]?.[lang] || seg;
      const href = "/" + segments.slice(0, i + 1).join("/");
      return { label, href };
    })
    .filter(Boolean) as { label: string; href?: string }[];
  // Last item should not be a link
  if (breadcrumbItems.length > 0) {
    delete breadcrumbItems[breadcrumbItems.length - 1].href;
  }

  return (
    <AuthGuard>
      <CurrencyProvider>
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
          {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}
          <div className="flex flex-col lg:flex-row gap-6">
            <DashboardSidebar />
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </CurrencyProvider>
    </AuthGuard>
  );
}
