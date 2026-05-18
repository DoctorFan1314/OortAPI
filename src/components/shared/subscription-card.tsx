"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Diamond, Sparkles, Zap, Star } from "lucide-react";

interface PlanData {
  id: number;
  name: string;
  display_name: string;
  tagline: string | null;
  tier: number;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  monthly_credits: number;
  popular: number;
  support_level: string;
  route_priority: string;
  max_concurrency?: number;
}

interface SubscriptionCardProps {
  plan: PlanData;
  lang: "zh" | "en";
  variant?: "select" | "current";
  billingCycle?: "monthly" | "yearly";
  displayCurrency?: string;
  exchangeRate?: number;
  selected?: boolean;
  onSelect?: () => void;
  children?: React.ReactNode;
}

const THEMES: Record<string, { gradientClass: string; shadowColor: string; accent: string; icon: typeof Sparkles }> = {
  spark: {
    gradientClass: "gradient-spark",
    shadowColor: "var(--plan-spark-from)",
    accent: "text-[var(--plan-spark-from)]",
    icon: Zap,
  },
  flare: {
    gradientClass: "gradient-flare",
    shadowColor: "var(--plan-flare-from)",
    accent: "text-[var(--plan-flare-from)]",
    icon: Sparkles,
  },
  pulse: {
    gradientClass: "gradient-pulse",
    shadowColor: "var(--plan-pulse-from)",
    accent: "text-[var(--plan-pulse-from)]",
    icon: Star,
  },
  nova: {
    gradientClass: "gradient-nova",
    shadowColor: "var(--plan-nova-from)",
    accent: "text-[var(--plan-nova-from)]",
    icon: Diamond,
  },
};

const TIER_LABELS: Record<string, { zh: string; en: string }> = {
  spark: { zh: "基础模型", en: "Basic Models" },
  flare: { zh: "高级模型", en: "Advanced Models" },
  pulse: { zh: "旗舰模型", en: "Flagship Models" },
  nova: { zh: "全部模型", en: "All Models" },
};

export function SubscriptionCard({
  plan,
  lang,
  variant = "select",
  billingCycle = "monthly",
  displayCurrency,
  exchangeRate = 7.3,
  selected,
  onSelect,
  children,
}: SubscriptionCardProps) {
  const theme = THEMES[plan.name] || THEMES.spark;
  const Icon = theme.icon;
  const isPopular = plan.popular === 1;
  const isNova = plan.name === "nova";

  // Determine display currency and conversion
  const targetCurrency = displayCurrency || plan.currency;
  const needsConversion = targetCurrency !== plan.currency;
  const convert = (price: number) => {
    if (!needsConversion) return price;
    return plan.currency === "CNY" && targetCurrency === "USD"
      ? price / exchangeRate
      : plan.currency === "USD" && targetCurrency === "CNY"
        ? price * exchangeRate
        : price;
  };

  const sym = targetCurrency === "CNY" ? "¥" : "$";
  const displayPrice = billingCycle === "yearly" ? convert(plan.yearly_price) : convert(plan.monthly_price);
  const priceLabel = billingCycle === "yearly"
    ? (lang === "zh" ? "/年" : "/yr")
    : (lang === "zh" ? "/月" : "/mo");

  const yearlySavings = Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100);

  if (variant === "current") {
    // Compact card for current subscription
    return (
      <div className={`relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
        <div className={`relative ${theme.gradientClass} p-5`}>
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
          </div>
          {isNova && (
            <div className="absolute top-2 right-2 opacity-15">
              <Diamond className="h-24 w-24 text-white" />
            </div>
          )}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-lg">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{plan.display_name}</h3>
                <p className="text-sm text-white/70">{plan.tagline || TIER_LABELS[plan.name]?.[lang]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-white">{sym}{displayPrice.toFixed(2)}</p>
              <p className="text-xs text-white/60">{priceLabel}</p>
            </div>
          </div>
        </div>
        {children && <div className="p-4 bg-card">{children}</div>}
      </div>
    );
  }

  // Select variant - full card with features
  return (
    <div
      className={`relative rounded-xl transition-all duration-300 cursor-pointer ${
        selected ? "ring-2 ring-primary shadow-lg" : "ring-1 ring-border hover:ring-muted-foreground/30"
      } ${isPopular ? "shadow-lg" : ""} hover:scale-[1.02] hover:shadow-xl`}
      onClick={onSelect}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className={`${theme.gradientClass} text-white border-0 px-4 py-1 text-[11px] font-bold shadow-lg`}>
            <Star className="h-3 w-3 mr-1 fill-current" />
            {lang === "zh" ? "最受欢迎" : "Most Popular"}
          </Badge>
        </div>
      )}

      {/* Card header with gradient */}
      <div className={`relative rounded-t-xl ${theme.gradientClass} p-5 overflow-hidden`}>
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        {isNova && (
          <div className="absolute top-2 right-2 opacity-20">
            <Diamond className="h-20 w-20 text-white" />
          </div>
        )}

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{plan.display_name}</h3>
            <p className="text-xs text-white/80">{plan.tagline || TIER_LABELS[plan.name]?.[lang] || plan.name}</p>
          </div>
        </div>

        {/* Price */}
        <div className="relative mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">{sym}{displayPrice.toFixed(2)}</span>
            <span className="text-sm text-white/70">{priceLabel}</span>
          </div>
          {billingCycle === "monthly" && (
            <p className="text-[11px] text-white/50 mt-1">
              {lang === "zh"
                ? `年付 ${sym}${convert(plan.yearly_price).toFixed(2)}/年 · 省 ${yearlySavings}%`
                : `Yearly ${sym}${convert(plan.yearly_price).toFixed(2)}/yr · Save ${yearlySavings}%`}
            </p>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 bg-card rounded-b-xl">
        {/* Credits */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
          <span className="text-sm text-muted-foreground">{lang === "zh" ? "每月额度" : "Monthly Credits"}</span>
          <span className="text-base font-bold text-foreground">{plan.monthly_credits.toLocaleString()}</span>
        </div>

        {/* Features */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{TIER_LABELS[plan.name]?.[lang] || plan.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{plan.max_concurrency || 10} {lang === "zh" ? "并发请求" : "concurrent requests"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">
              {plan.support_level === "dedicated" ? (lang === "zh" ? "专属客服支持" : "Dedicated Support") : plan.support_level === "priority" ? (lang === "zh" ? "优先技术支持" : "Priority Support") : plan.support_level === "email" ? (lang === "zh" ? "邮件技术支持" : "Email Support") : (lang === "zh" ? "社区支持" : "Community Support")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{lang === "zh" ? "非高峰时段优惠计费" : "Off-peak discount pricing"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{lang === "zh" ? "兼容主流编程工具" : "Compatible with coding tools"}</span>
          </div>
        </div>

        {/* Action area */}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
