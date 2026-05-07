"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, Menu, X, Sun, Moon, Languages, ChevronDown, TrendingUp, Tags, BookOpen, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { useTheme } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loaded, logout } = useAuth();
  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const { lang, setLang, t } = useI18n();

  const navLinks = [
    { href: "/", label: t.common.home },
    { href: "/skills", label: t.common.skills, highlight: true },
    { href: "/prompts", label: t.common.prompts },
  ];

  const moreLinks = [
    { href: "/categories", label: t.common.categories, icon: LayoutGrid },
    { href: "/trending", label: t.common.trending, icon: TrendingUp },
    { href: "/tags", label: t.common.tags, icon: Tags },
    { href: "/guide", label: t.common.guide, icon: BookOpen },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  // Close dropdown on route change
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  function handleSearch(e?: React.KeyboardEvent<HTMLInputElement>) {
    if (e && e.key !== "Enter") return;
    const q = searchQuery.trim();
    if (q) {
      const encoded = encodeURIComponent(q);
      if (pathname.startsWith("/skills")) {
        router.push(`/skills?q=${encoded}`);
      } else if (pathname.startsWith("/prompts")) {
        router.push(`/prompts?q=${encoded}`);
      } else {
        // Default: go to skills for general search
        router.push(`/skills?q=${encoded}`);
      }
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleLogout() {
    logout();
    toast(t.common.logout);
    setSheetOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
            <span className="text-sm font-bold text-primary">AI</span>
          </div>
          <span className="text-lg font-semibold text-foreground hidden sm:inline">AI Skills Hub</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 text-sm transition-colors rounded-md hover:bg-secondary ${link.highlight ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1 px-3 py-2 text-sm transition-colors rounded-md hover:bg-secondary ${moreOpen ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              {t.common.more}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            {moreOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-[fadeIn_0.1s_ease-out] z-50">
                {moreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-1">
              <Input
                placeholder={t.common.search}
                className="h-8 w-40 md:w-56 bg-secondary border-border text-foreground placeholder:text-muted-foreground text-sm"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Button variant="ghost" size="icon-sm" onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-muted-foreground hover:text-foreground" aria-label={t.common.closeSearch} aria-expanded={true}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon-sm" onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground" aria-label={t.common.search} aria-expanded={false}>
              <Search className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
            aria-label={t.common.toggleTheme}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="text-muted-foreground hover:text-foreground text-xs font-medium"
            aria-label={t.common.switchLanguage}
          >
            <Languages className="h-4 w-4" />
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {!loaded ? null : user ? (
              <Link href="/profile">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity overflow-hidden shrink-0">
                  {user.avatar ? (
                    <Image src={user.avatar} alt={user.username} width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t.common.login}</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">{t.common.register}</Button>
                </Link>
              </>
            )}
          </div>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="lg:hidden text-muted-foreground hover:text-foreground" aria-label={t.common.openNavigation}>
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="bg-card border-border w-72">
              <SheetTitle className="text-foreground sr-only">{t.common.navigationMenu}</SheetTitle>
              <nav className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setSheetOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary">
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <p className="px-4 py-1 text-xs text-muted-foreground/60 uppercase tracking-wider">{t.common.more}</p>
                {moreLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setSheetOpen(false)} className="flex items-center gap-2.5 px-4 py-3 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary">
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-border my-4" />
                {!loaded ? null : user ? (
                  <>
                    <Link href="/profile" onClick={() => setSheetOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground">
                      {t.common.profile}
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-left text-muted-foreground hover:text-foreground">{t.common.logout}</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setSheetOpen(false)} className="px-4 py-3 text-muted-foreground hover:text-foreground">{t.common.login}</Link>
                    <Link href="/register" onClick={() => setSheetOpen(false)} className="px-4 py-3">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium">{t.common.register}</Button>
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
