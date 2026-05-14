"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { LayoutDashboard, Key, BarChart3, Wallet, Radio, Settings, Shield, Users, Gift, Percent, Sparkles, ListChecks } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "overview" as const },
  { href: "/dashboard/token-plan", icon: Sparkles, labelKey: "tokenPlan" as const },
  { href: "/dashboard/keys", icon: Key, labelKey: "apiKeys" as const },
  { href: "/dashboard/usage", icon: BarChart3, labelKey: "usage" as const },
  { href: "/dashboard/billing", icon: Wallet, labelKey: "billing" as const },
  { href: "/dashboard/channels", icon: Radio, labelKey: "channels" as const, adminOnly: true },
  { href: "/dashboard/multiplier", icon: Percent, labelKey: "multiplier" as const, adminOnly: true },
  { href: "/dashboard/admin/plans", icon: ListChecks, labelKey: "planManage" as const, adminOnly: true },
  { href: "/dashboard/users", icon: Users, labelKey: "users" as const, adminOnly: true },
  { href: "/dashboard/redeem", icon: Gift, labelKey: "redeem" as const, adminOnly: true },
  { href: "/dashboard/settings", icon: Settings, labelKey: "settings" as const },
];

const LABELS: Record<string, { zh: string; en: string }> = {
  overview: { zh: "概览", en: "Overview" },
  tokenPlan: { zh: "我的订阅", en: "My Subscription" },
  apiKeys: { zh: "API Keys", en: "API Keys" },
  usage: { zh: "调用日志", en: "Call Logs" },
  billing: { zh: "账单中心", en: "Billing" },
  channels: { zh: "渠道管理", en: "Channels" },
  multiplier: { zh: "倍率管理", en: "Multipliers" },
  planManage: { zh: "套餐管理", en: "Plan Management" },
  users: { zh: "用户管理", en: "Users" },
  redeem: { zh: "兑换码", en: "Redeem Codes" },
  settings: { zh: "设置", en: "Settings" },
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { lang } = useI18n();
  const { user } = useAuth();

  const items = NAV_ITEMS.filter(item => !item.adminOnly || user?.role === "admin");

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <nav className="space-y-1" role="navigation" aria-label="Dashboard navigation">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{LABELS[item.labelKey][lang]}</span>
              {item.adminOnly && (
                <Shield className="h-3 w-3 ml-auto text-yellow-500" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
