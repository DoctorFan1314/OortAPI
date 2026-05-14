"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Menu, X, Sun, Moon, Languages, ChevronDown, BookOpen, LayoutDashboard, Terminal, FolderOpen, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";
import { NotificationBell } from "@/components/shared/notification-bell";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loaded, logout } = useAuth();
  const { toast: showToast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const navLinks = [
    { href: "/", label: lang === "zh" ? "首页" : "Home" },
    ...(user ? [{ href: "/dashboard", label: lang === "zh" ? "控制台" : "Dashboard" }] : []),
    { href: "/token-plan", label: lang === "zh" ? "Token Plan" : "Token Plan" },
    { href: "/models", label: lang === "zh" ? "模型市场" : "Models" },
    { href: "/docs", label: lang === "zh" ? "文档" : "Docs" },
    { href: "/resources", label: lang === "zh" ? "资源中心" : "Resources" },
  ];

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userMenuOpen]);

  // Close dropdown on route change
  useEffect(() => { setUserMenuOpen(false); setSheetOpen(false); }, [pathname]);

  const handleUserMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!userMenuOpen) return;
      const items = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll('[role="menuitem"]')
      ) as HTMLElement[];
      if (items.length === 0) return;
      const idx = items.indexOf(document.activeElement as HTMLElement);
      if (e.key === "ArrowDown") { e.preventDefault(); items[(idx + 1) % items.length]?.focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus(); }
      if (e.key === "Escape") { setUserMenuOpen(false); }
    },
    [userMenuOpen]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      const encoded = encodeURIComponent(q);
      router.push(`/search?q=${encoded}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  async function handleLogout() {
    await logout();
    showToast(lang === "zh" ? "已退出登录" : "Logged out", "info");
    setSheetOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-sm font-bold text-primary">O</span>
          </div>
          <span className="text-lg font-semibold text-foreground hidden sm:inline">OortAPI</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)) ? "page" : undefined}
              className={`px-3 py-2 text-sm transition-colors rounded-md hover:bg-secondary ${
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-foreground font-medium bg-secondary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form role="search" onSubmit={handleSearch} className="flex items-center gap-1">
              <Input
                placeholder={lang === "zh" ? "搜索..." : "Search..."}
                className="h-8 w-40 md:w-56 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-sm"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="ghost" size="icon-sm" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground" aria-label="Close search">
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <Button variant="ghost" size="icon-sm" onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground" aria-label="Search">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline text-[10px] text-muted-foreground/60 ml-1">Ctrl+K</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 hidden dark:block" />
            <Moon className="h-4 w-4 block dark:hidden" />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
            aria-label="Switch language"
          >
            <Languages className="h-4 w-4" />
          </Button>

          {user && <NotificationBell />}

          <div className="hidden md:flex items-center gap-2">
            {!loaded ? null : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 group"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  aria-label={user.username}
                >
                  <div role="img" aria-label={user.username} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer group-hover:opacity-90 transition-opacity overflow-hidden shrink-0">
                    {user.avatar ? (
                      <Image src={user.avatar} alt={user.username} width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform hidden md:block ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.1s_ease-out]"
                    onKeyDown={handleUserMenuKeyDown}
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground truncate">{user.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" role="menuitem" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:bg-secondary focus:text-foreground focus-visible:outline-none">
                        <LayoutDashboard className="h-4 w-4" />
                        {lang === "zh" ? "控制台" : "Dashboard"}
                      </Link>
                      <Link href="/profile" role="menuitem" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:bg-secondary focus:text-foreground focus-visible:outline-none">
                        <User className="h-4 w-4" />
                        {lang === "zh" ? "个人中心" : "Profile"}
                      </Link>
                      <Link href="/dashboard/settings" role="menuitem" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:bg-secondary focus:text-foreground focus-visible:outline-none">
                        <Settings className="h-4 w-4" />
                        {lang === "zh" ? "设置" : "Settings"}
                      </Link>
                    </div>
                    <div className="border-t border-border py-1">
                      <button
                        role="menuitem"
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus:bg-secondary focus:text-foreground focus-visible:outline-none"
                      >
                        <LogOut className="h-4 w-4" />
                        {lang === "zh" ? "退出登录" : "Log Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{lang === "zh" ? "登录" : "Log In"}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">{lang === "zh" ? "注册" : "Sign Up"}</Button>
                </Link>
              </>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="lg:hidden text-muted-foreground hover:text-foreground" aria-label="Open navigation">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="bg-card border-border w-72">
              <SheetTitle className="text-foreground sr-only">{lang === "zh" ? "导航菜单" : "Navigation Menu"}</SheetTitle>
              {!loaded ? null : user ? (
                <div className="mt-8 mb-4 px-4 flex items-center justify-between">
                  <Link href="/dashboard" onClick={() => setSheetOpen(false)} className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium overflow-hidden shrink-0">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.username} width={40} height={40} className="h-10 w-10 rounded-full object-cover" unoptimized />
                      ) : (
                        <span aria-label={user.username}>{user.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{user.username}</span>
                  </Link>
                  <NotificationBell />
                </div>
              ) : null}
              <nav className="flex flex-col gap-1 mt-4" aria-label="Navigation menu">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setSheetOpen(false)} className={`px-4 py-3 transition-colors rounded-md hover:bg-secondary ${
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                      ? "text-foreground font-medium bg-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border my-4" />
                {/* Language and Theme toggles for mobile */}
                <div className="flex items-center gap-2 px-4 py-2">
                  <button
                    onClick={() => setLang(lang === "zh" ? "en" : "zh")}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Languages className="h-4 w-4" />
                    {lang === "zh" ? "English" : "中文"}
                  </button>
                  <button
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {resolvedTheme === "dark" ? (lang === "zh" ? "亮色" : "Light") : (lang === "zh" ? "暗色" : "Dark")}
                  </button>
                </div>
                <div className="border-t border-border my-4" />
                {!loaded ? null : user ? (
                  <>
                    <Link href="/profile" onClick={() => setSheetOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground">
                      {lang === "zh" ? "个人中心" : "Profile"}
                    </Link>
                    <Link href="/dashboard/settings" onClick={() => setSheetOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground">
                      {lang === "zh" ? "设置" : "Settings"}
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-left text-muted-foreground hover:text-foreground">
                      {lang === "zh" ? "退出登录" : "Log Out"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setSheetOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground">{lang === "zh" ? "登录" : "Log In"}</Link>
                    <Link href="/register" onClick={() => setSheetOpen(false)} className="px-4 py-3">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">{lang === "zh" ? "注册" : "Sign Up"}</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
