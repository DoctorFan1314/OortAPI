"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { LayoutDashboard, Cpu, BookOpen, CreditCard, User } from "lucide-react";

const NAV_ITEMS = (user: boolean, lang: string) => [
  { href: "/", label: lang === "zh" ? "首页" : "Home", icon: LayoutDashboard, exact: true },
  ...(user ? [{ href: "/dashboard", label: lang === "zh" ? "控制台" : "Dashboard", icon: LayoutDashboard, exact: false }] : []),
  { href: "/models", label: lang === "zh" ? "模型" : "Models", icon: Cpu, exact: false },
  { href: "/docs", label: lang === "zh" ? "文档" : "Docs", icon: BookOpen, exact: false },
  ...(!user ? [{ href: "/login", label: lang === "zh" ? "登录" : "Login", icon: User, exact: false }] : [{ href: "/profile", label: lang === "zh" ? "我的" : "Profile", icon: User, exact: false }]),
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { lang } = useI18n();

  // Only show on mobile
  // Don't show on playground (full-screen view)
  if (pathname.includes("/playground")) return null;

  const items = NAV_ITEMS(!!user, lang || "en").slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 backdrop-blur-xl lg:hidden safe-area-bottom" aria-label="Mobile navigation">
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "fill-primary/10" : ""}`} />
              <span className="text-[10px] font-medium truncate max-w-full">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
