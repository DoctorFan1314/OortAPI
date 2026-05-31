"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const ROUTE_LABELS: Record<string, Record<string, string>> = {
  zh: {
    dashboard: "控制台",
    keys: "API Keys",
    playground: "测试场",
    usage: "调用日志",
    billing: "充值中心",
    "token-plan": "我的订阅",
    channels: "渠道管理",
    multiplier: "倍率规则",
    settings: "设置",
    users: "用户管理",
    redeem: "兑换码",
    admin: "管理",
    plans: "套餐管理",
    audit: "审计日志",
    monitor: "系统监控",
    webhooks: "Webhook",
    models: "模型管理",
    routing: "智能路由",
  },
  en: {
    dashboard: "Dashboard",
    keys: "API Keys",
    playground: "Playground",
    usage: "Call Logs",
    billing: "Billing",
    "token-plan": "My Subscription",
    channels: "Channels",
    multiplier: "Multipliers",
    settings: "Settings",
    users: "Users",
    redeem: "Redeem Codes",
    admin: "Admin",
    plans: "Plan Management",
    audit: "Audit Logs",
    monitor: "System Monitor",
    webhooks: "Webhooks",
    models: "Model Management",
    routing: "Smart Routing",
  },
};

export function Breadcrumbs({ lang }: { lang: string }) {
  const pathname = usePathname();
  const labels = ROUTE_LABELS[lang] || ROUTE_LABELS.en;

  // Remove /dashboard prefix and split
  const segments = pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = [
    { href: "/dashboard", label: labels.dashboard || "Dashboard" },
    ...segments.map((seg, i) => {
      const href = `/dashboard/${segments.slice(0, i + 1).join("/")}`;
      // Handle [id] dynamic segments
      const label = seg.match(/^\d+$/) ? `#${seg}` : (labels[seg] || seg);
      return { href, label };
    }),
  ];

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-4" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
