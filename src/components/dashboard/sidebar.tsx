"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard, Key, BarChart3, Wallet, Radio,
  Settings, Users, Gift, Percent, Sparkles, ListChecks,
  ChevronDown, FileText, Webhook, Activity, Play,
} from "lucide-react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";

// ─── Data ──────────────────────────────────────────────────

interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  labelKey: string;
  adminOnly?: boolean;
}

interface NavGroup {
  headerKey: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    headerKey: "core",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, labelKey: "overview" },
      { href: "/dashboard/keys", icon: Key, labelKey: "apiKeys" },
      { href: "/dashboard/playground", icon: Play, labelKey: "playground" },
    ],
  },
  {
    headerKey: "billing",
    items: [
      { href: "/dashboard/token-plan", icon: Sparkles, labelKey: "tokenPlan" },
      { href: "/dashboard/usage", icon: BarChart3, labelKey: "usage" },
      { href: "/dashboard/billing", icon: Wallet, labelKey: "billing" },
    ],
  },
  {
    headerKey: "admin",
    items: [
      { href: "/dashboard/channels", icon: Radio, labelKey: "channels", adminOnly: true },
      { href: "/dashboard/multiplier", icon: Percent, labelKey: "multiplier", adminOnly: true },
      { href: "/dashboard/admin/plans", icon: ListChecks, labelKey: "planManage", adminOnly: true },
      { href: "/dashboard/users", icon: Users, labelKey: "users", adminOnly: true },
      { href: "/dashboard/redeem", icon: Gift, labelKey: "redeem", adminOnly: true },
      { href: "/dashboard/admin/audit", icon: FileText, labelKey: "audit", adminOnly: true },
      { href: "/dashboard/admin/monitor", icon: Activity, labelKey: "monitor", adminOnly: true },
      { href: "/dashboard/admin/webhooks", icon: Webhook, labelKey: "webhooks", adminOnly: true },
    ],
  },
];

const SETTINGS_ITEM: NavItem = { href: "/dashboard/settings", icon: Settings, labelKey: "settings" };

const GROUP_HEADERS: Record<string, { zh: string; en: string }> = {
  core: { zh: "核心服务", en: "Core" },
  billing: { zh: "额度与账单", en: "Billing & Usage" },
  admin: { zh: "管理中心", en: "Administration" },
};

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
  audit: { zh: "审计日志", en: "Audit Logs" },
  monitor: { zh: "系统监控", en: "System Monitor" },
  webhooks: { zh: "Webhook", en: "Webhooks" },
  playground: { zh: "API 测试", en: "API Playground" },
  settings: { zh: "设置", en: "Settings" },
};

// ─── Component ─────────────────────────────────────────────

export function DashboardSidebar() {
  const pathname = usePathname();
  const { lang } = useI18n();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const { data: keysData } = useSWR<{ keys: Array<{ enabled: number }> }>(
    user ? "/api/dashboard/keys" : null,
    dashboardSWRConfig,
  );
  const activeKeys = keysData?.keys?.filter((k) => k.enabled === 1).length ?? 0;

  const getBadge = (href: string): number | null => {
    if (href === "/dashboard/keys" && activeKeys > 0) return activeKeys;
    return null;
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  // Only show admin group items the user has access to
  const isAdmin = user?.role === "admin";

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Mobile collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden transition-colors"
        aria-expanded={!collapsed}
      >
        <span>{lang === "zh" ? "导航菜单" : "Navigation"}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", collapsed && "-rotate-90")} />
      </button>

      {/* Desktop: sticky + full-height flex column */}
      <div
        className={cn(
          "lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] flex flex-col",
          collapsed && "hidden lg:flex",
        )}
      >
        {/* Scrollable groups */}
        <nav
          className="flex-1 overflow-y-auto scrollbar-hide space-y-1"
          role="navigation"
          aria-label="Dashboard navigation"
        >
          {GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.headerKey}>
                <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase px-3 pt-6 pb-1.5">
                  {GROUP_HEADERS[group.headerKey][lang]}
                </div>
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2",
                      isActive(item.href)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{LABELS[item.labelKey][lang]}</span>
                    {getBadge(item.href) !== null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono-force font-medium min-w-[18px] text-center">
                        {getBadge(item.href)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Settings — fixed at bottom */}
        <div className="border-t border-border pt-3 mt-3">
          <Link
            href={SETTINGS_ITEM.href}
            aria-current={isActive(SETTINGS_ITEM.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors border-l-2",
              isActive(SETTINGS_ITEM.href)
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <SETTINGS_ITEM.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{LABELS[SETTINGS_ITEM.labelKey][lang]}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
