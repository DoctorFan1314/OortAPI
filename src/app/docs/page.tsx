"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/contexts/i18n-context";
import { Zap, Code, Key, Activity, Server, DollarSign, AlertTriangle, Gauge, Book, Layout, ArrowRight, Search, Sparkles, HelpCircle, Layers, Cpu, ExternalLink, Shield } from "lucide-react";

interface DocCard {
  href: string;
  icon: typeof Zap;
  labelKey: string;
  descKey: string;
  group: "getting-started" | "api-reference" | "guides" | "resources";
}

const GROUPS = [
  { key: "getting-started" as const, icon: Zap, i18nKey: "groupGettingStarted" },
  { key: "api-reference" as const, icon: Code, i18nKey: "groupApiReference" },
  { key: "guides" as const, icon: Book, i18nKey: "navGuides" },
  { key: "resources" as const, icon: HelpCircle, i18nKey: "navResources" },
];

const cards: DocCard[] = [
  { href: "/docs/quickstart", icon: Zap, labelKey: "navQuickStart", descKey: "quickStart", group: "getting-started" },
  { href: "/docs/authentication", icon: Key, labelKey: "navAuthentication", descKey: "authentication", group: "getting-started" },
  { href: "/docs/endpoints", icon: Code, labelKey: "navEndpoints", descKey: "endpointsTitle", group: "api-reference" },
  { href: "/docs/sdk", icon: Activity, labelKey: "navSdk", descKey: "sdkSupport", group: "api-reference" },
  { href: "/docs/streaming", icon: Activity, labelKey: "navStreaming", descKey: "streamTitle", group: "api-reference" },
  { href: "/docs/errors", icon: AlertTriangle, labelKey: "navErrors", descKey: "errorCodes", group: "api-reference" },
  { href: "/docs/rate-limits", icon: Gauge, labelKey: "navRateLimits", descKey: "rateLimiting", group: "api-reference" },
  { href: "/docs/api-reference", icon: Layout, labelKey: "navInteractiveApi", descKey: "openapiSpec", group: "api-reference" },
  { href: "/docs/features", icon: Layers, labelKey: "navFeatures", descKey: "featuresDesc", group: "guides" },
  { href: "/docs/models-pricing", icon: Cpu, labelKey: "navModelsPricing", descKey: "modelsPricingDesc", group: "guides" },
  { href: "/docs/integrations", icon: Book, labelKey: "navIntegrations", descKey: "appsTitle", group: "guides" },
  { href: "/docs/ai-tools", icon: Book, labelKey: "navAiTools", descKey: "aiToolsTitle", group: "guides" },
  { href: "/docs/deployment", icon: Server, labelKey: "navDeployment", descKey: "deployTitle", group: "guides" },
  { href: "/docs/security", icon: Shield, labelKey: "navSecurity", descKey: "securityDesc", group: "guides" },
  { href: "/docs/faq", icon: HelpCircle, labelKey: "navFaq", descKey: "faqDesc", group: "resources" },
  { href: "/docs/pricing", icon: DollarSign, labelKey: "navPricing", descKey: "pricing", group: "resources" },
  { href: "/docs/changelog", icon: Zap, labelKey: "navChangelog", descKey: "changelogDesc", group: "resources" },
];

function DocCard({ href, icon: Icon, label, desc }: { href: string; icon: typeof Zap; label: string; desc: string }) {
  return (
    <Link href={href} className="glass-card glass-card-hover backdrop-blur-sm p-5 rounded-xl border border-border/50 hover:border-primary/40 transition-all duration-300 group">
      <Icon className="h-5 w-5 text-primary mb-3" />
      <h3 className="font-semibold text-sm mb-1">{label}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
      <ArrowRight className="h-3.5 w-3.5 mt-3 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

export default function DocsLandingPage() {
  const { lang, t } = useI18n();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const L = t.apiDocs;
  const Lr = L as Record<string, string>;

  return (
    <div className="min-h-screen space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl glass-card p-8 lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, var(--foreground) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 hero-animate-1">
            <Sparkles className="h-3 w-3" />
            {lang === "zh" ? "OpenAI + Anthropic 双协议兼容 · 一个 Key 聚合所有 AI 服务" : "OpenAI + Anthropic Dual Protocol · One Key for All AI Services"}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3 hero-animate-2">{L.title}</h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-6 hero-animate-3">{L.subtitle}</p>

          {/* Quick stat badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { label: lang === "zh" ? "20+ 模型" : "20+ Models", icon: Cpu },
              { label: lang === "zh" ? "双协议兼容" : "Dual Protocol", icon: Layers },
              { label: lang === "zh" ? "SDK 一键接入" : "SDK Drop-in", icon: Zap },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 text-xs font-medium">
                  <Icon className="h-3 w-3 text-primary" />
                  {badge.label}
                </div>
              );
            })}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && searchQuery.trim()) { router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`); } }}
              placeholder={Lr.navDocsSearchPlaceholder || "Search docs..."}
              aria-label="Search documentation"
              className="w-full pl-10 pr-4 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Quick Start inline */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {lang === "zh" ? "3 步开始使用" : "Get Started in 3 Steps"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              step: "1",
              title: lang === "zh" ? "获取 API Key" : "Get API Key",
              desc: lang === "zh" ? "注册后在控制台创建 Key" : "Create a key in Dashboard after registering",
              href: "/dashboard/keys",
              linkText: lang === "zh" ? "前往创建" : "Go to Dashboard",
            },
            {
              step: "2",
              title: lang === "zh" ? "设置 Base URL" : "Set Base URL",
              desc: lang === "zh" ? "选择 OpenAI 或 Anthropic 协议地址" : "Choose OpenAI or Anthropic protocol URL",
              href: "/docs/quickstart",
              linkText: lang === "zh" ? "查看地址" : "View URLs",
            },
            {
              step: "3",
              title: lang === "zh" ? "开始调用" : "Start Calling",
              desc: lang === "zh" ? "用 SDK 或 cURL 发送第一个请求" : "Send your first request with SDK or cURL",
              href: "/docs/sdk",
              linkText: lang === "zh" ? "SDK 示例" : "SDK Examples",
            },
          ].map((item) => (
            <div key={item.step} className="glass-card rounded-xl p-5 border border-border/50">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                {item.step}
              </span>
              <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
              <Link href={item.href} className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                {item.linkText} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Data-driven card groups */}
      <div className="space-y-10">
        {GROUPS.map(group => {
          const groupCards = cards.filter(c => c.group === group.key);
          const GroupIcon = group.icon;
          return (
            <div key={group.key}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <GroupIcon className="h-5 w-5 text-primary" />
                {Lr[group.i18nKey] || group.i18nKey}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupCards.map(card => (
                  <DocCard
                    key={card.href}
                    href={card.href}
                    icon={card.icon}
                    label={Lr[card.labelKey] || card.labelKey}
                    desc={Lr[card.descKey] || card.descKey}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Need Help */}
      <section className="rounded-xl border border-border/50 glass-card p-6 text-center space-y-4">
        <h2 className="text-lg font-bold">
          {lang === "zh" ? "需要帮助？" : "Need Help?"}
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          {lang === "zh"
            ? "如果文档没有解答你的问题，可以通过以下方式获取帮助："
            : "If the docs didn't answer your question, get help through these channels:"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/docs/faq"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            {lang === "zh" ? "常见问题" : "FAQ"}
          </Link>
          <a
            href="https://github.com/DoctorFan1314/OortAPI/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            GitHub Issues
          </a>
        </div>
      </section>
    </div>
  );
}
