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
  Cpu,
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
    headerKey: "groupCore",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, labelKey: "overview" },
      { href: "/dashboard/keys", icon: Key, labelKey: "apiKeys" },
      { href: "/dashboard/playground", icon: Play, labelKey: "playground" },
    ],
  },
  {
    headerKey: "groupBilling",
    items: [
      { href: "/dashboard/token-plan", icon: Sparkles, labelKey: "tokenPlan" },
      { href: "/dashboard/usage", icon: BarChart3, labelKey: "usage" },
      { href: "/dashboard/billing", icon: Wallet, labelKey: "billing" },
    ],
  },
  {
    headerKey: "groupAdmin",
    items: [
      { href: "/dashboard/channels", icon: Radio, labelKey: "channels", adminOnly: true },
      { href: "/dashboard/multiplier", icon: Percent, labelKey: "multiplier", adminOnly: true },
      { href: "/dashboard/admin/plans", icon: ListChecks, labelKey: "planManage", adminOnly: true },
      { href: "/dashboard/users", icon: Users, labelKey: "users", adminOnly: true },
      { href: "/dashboard/redeem", icon: Gift, labelKey: "redeem", adminOnly: true },
      { href: "/dashboard/admin/audit", icon: FileText, labelKey: "audit", adminOnly: true },
      { href: "/dashboard/admin/monitor", icon: Activity, labelKey: "monitor", adminOnly: true },
      { href: "/dashboard/admin/webhooks", icon: Webhook, labelKey: "webhooks", adminOnly: true },
      { href: "/dashboard/admin/models", icon: Cpu, labelKey: "modelManage", adminOnly: true },
    ],
  },
];

const SETTINGS_ITEM: NavItem = { href: "/dashboard/settings", icon: Settings, labelKey: "settings" };

// ─── Component ─────────────────────────────────────────────

export function DashboardSidebar() {
  const pathname = usePathname();
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const { data: keysData } = useSWR<{ keys: Array<{ enabled: number }> }>(
    user ? "/api/dashboard/keys" : null,
    dashboardSWRConfig,
  );
  const activeKeys = keysData?.keys?.filter((k) => k.enabled === 1).length ?? 0;

  const { data: statsData } = useSWR<{ today_calls?: number; balance?: number }>(
    user ? "/api/dashboard/stats" : null,
    dashboardSWRConfig,
  );

  const getBadge = (href: string): { value: number | string; variant?: "default" | "destructive" } | null => {
    if (href === "/dashboard/keys" && activeKeys > 0) return { value: activeKeys };
    if (href === "/dashboard/usage" && statsData?.today_calls && statsData.today_calls > 0) return { value: statsData.today_calls };
    if (href === "/dashboard/billing" && statsData?.balance !== undefined && statsData.balance < 1) return { value: "!", variant: "destructive" };
    return null;
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));

  const closeMobileNav = () => {
    if (window.innerWidth < 1024) setCollapsed(true);
  };

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

      {/* Desktop: normal flow, natural height */}
      <div
        className={cn(
          "flex flex-col",
          collapsed && "hidden lg:flex",
        )}
      >
        {/* Groups */}
        <nav
          className="space-y-1"
          role="navigation"
          aria-label="Dashboard navigation"
        >
          {GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.headerKey}>
                <div className="text-sm font-semibold tracking-wider text-muted-foreground uppercase px-3 pt-6 pb-1.5">
                  {t.dashboard[group.headerKey as keyof typeof t.dashboard]}
                </div>
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileNav}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2",
                      isActive(item.href)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{t.dashboard[item.labelKey as keyof typeof t.dashboard]}</span>
                    {(() => {
                      const badge = getBadge(item.href);
                      return badge ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono-force font-medium min-w-[18px] text-center ${badge.variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                          {badge.value}
                        </span>
                      ) : null;
                    })()}
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
            onClick={closeMobileNav}
            aria-current={isActive(SETTINGS_ITEM.href) ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors border-l-2",
              isActive(SETTINGS_ITEM.href)
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <SETTINGS_ITEM.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1">{t.dashboard[SETTINGS_ITEM.labelKey as keyof typeof t.dashboard]}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
