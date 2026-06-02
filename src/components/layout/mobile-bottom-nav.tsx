"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { LayoutDashboard, Home, Cpu, BookOpen, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useI18n();

  const NAV_ITEMS = [
    { href: "/", label: t.common.home, icon: Home, exact: true },
    ...(user ? [{ href: "/dashboard", label: t.dashboard.title, icon: LayoutDashboard, exact: false }] : []),
    { href: "/models", label: t.common.models, icon: Cpu, exact: false },
    { href: "/docs", label: t.common.docs, icon: BookOpen, exact: false },
    ...(!user ? [{ href: "/login", label: t.common.login, icon: User, exact: false }] : [{ href: "/profile", label: t.common.profile, icon: User, exact: false }]),
  ];

  const items = NAV_ITEMS.slice(0, 5);

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
              aria-current={active ? "page" : undefined}
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
