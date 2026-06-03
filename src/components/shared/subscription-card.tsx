"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle, Diamond, Sparkles, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/hooks/use-count-up";
import { useI18n } from "@/contexts/i18n-context";

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

const TIER_KEY: Record<string, string> = {
  spark: "basicModels",
  flare: "advancedModels",
  pulse: "flagshipModels",
  nova: "allModels",
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
  const { t } = useI18n();
  const getTierLabel = (name: string) => (t.dashboard as Record<string, string>)[TIER_KEY[name]] || name;
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
    ? t.dashboard.pricePerYear
    : t.dashboard.pricePerMonth;

  const yearlySavings = Math.round((1 - plan.yearly_price / (plan.monthly_price * 12)) * 100);
  const priceInt = Math.round(displayPrice);
  const priceDec = (displayPrice % 1).toFixed(2).slice(-3);
  const animatedPrice = useCountUp(priceInt, 500, true);

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
                <p className="text-sm text-white/70">{plan.tagline || getTierLabel(plan.name)}</p>
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

  // breathing参数 — 值越高越明显
  const breathDur = isPopular ? "3s" : "5s";
  const glowMid = isPopular ? "50%" : "30%";
  const glowPeak = isPopular ? "75%" : "50%";

  // "边框"用 box-shadow spread 实现(0 0 0 1px)，不占盒模型，圆角无偏移，不透明
  // "呼吸光晕"用 blur shadow (0 0 Npx color)
  return (
    <>
    <div
      className={cn(
        "relative rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]",
        selected ? "ring-2 ring-primary" : "",
        isPopular && "scale-[1.02] -translate-y-2 z-10 shadow-xl hover:scale-[1.04]",
      )}
      style={{
        animation: `breath-${plan.name} ${breathDur} ease-in-out infinite`,
      }}
      onClick={onSelect}
    >
      <style>{`
        @keyframes breath-${plan.name} {
          0%, 100% {
            box-shadow: 0 0 0 1px var(--plan-${plan.name}-from),
                        0 0 10px color-mix(in srgb, var(--plan-${plan.name}-from) ${glowMid}, transparent);
          }
          50% {
            box-shadow: 0 0 0 1px var(--plan-${plan.name}-from),
                        0 0 24px color-mix(in srgb, var(--plan-${plan.name}-from) ${glowPeak}, transparent);
          }
        }
      `}</style>
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1 text-[11px] font-bold shadow-lg shadow-orange-500/25">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {t.dashboard.mostPopular}
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
            <p className="text-xs text-white/80">{plan.tagline || getTierLabel(plan.name)}</p>
          </div>
        </div>

        {/* Price with count-up animation */}
        <div className="relative mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-white">{sym}{animatedPrice.toLocaleString()}{priceDec}</span>
            <span className="text-sm text-white/70">{priceLabel}</span>
          </div>
          {/* Per-million-token price */}
          {plan.monthly_credits > 0 && (() => {
            const perMillion = (convert(plan.monthly_price) / plan.monthly_credits) * 1000000;
            return (
              <p className="text-[10px] text-white/40 mt-0.5">
                ≈ {sym}{perMillion < 0.01 ? perMillion.toFixed(4) : perMillion.toFixed(2)} {t.dashboard.perMillionTokens}
              </p>
            );
          })()}
          {billingCycle === "yearly" ? (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-white/40 line-through">{sym}{convert(plan.monthly_price * 12).toFixed(2)}</span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-white/15">{t.dashboard.saveAmount.replace("{amount}", `${sym}${(convert(plan.monthly_price * 12) - convert(plan.yearly_price)).toFixed(2)}`)}</span>
            </div>
          ) : (
            <p className="text-[11px] text-white/50 mt-1">
              {t.dashboard.yearlyPriceInfo
                .replace("{price}", `${sym}${convert(plan.yearly_price).toFixed(2)}`)
                .replace("{amount}", `${sym}${(convert(plan.monthly_price * 12) - convert(plan.yearly_price)).toFixed(2)}`)}
            </p>
          )}
        </div>
      </div>

      {/* Popular card separator glow bar */}
      {isPopular && (
        <div className="relative h-[4px] overflow-hidden shadow-[0_2px_12px_rgba(168,85,247,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer-slide_2s_linear_infinite]" />
        </div>
      )}

      {/* Card body */}
      <div className="px-5 pt-3 pb-5 bg-card rounded-b-xl">
        {/* Credits */}
        <div className="flex items-baseline justify-between mb-2 pb-1.5 border-b border-border/20">
          <span className="text-sm text-muted-foreground">{t.dashboard.monthlyCredits}</span>
          <div className="text-right">
            <span className={`text-base font-bold ${theme.accent}`}>{plan.monthly_credits.toLocaleString()}</span>
            <div className="text-[10px] text-muted-foreground leading-tight text-right">{t.dashboard.creditsLabel}</div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{getTierLabel(plan.name)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{plan.max_concurrency || 10} {t.dashboard.concurrentRequests}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">
              {plan.support_level === "dedicated" ? t.dashboard.dedicatedSupport : plan.support_level === "priority" ? t.dashboard.prioritySupport : plan.support_level === "email" ? t.dashboard.emailSupport : t.dashboard.communitySupport}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{t.dashboard.offPeakPricing}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className={`h-4 w-4 ${theme.accent} shrink-0`} />
            <span className="text-foreground">{t.dashboard.compatibleTools}</span>
          </div>
        </div>

        {/* Action area */}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
    </>
  );
}
