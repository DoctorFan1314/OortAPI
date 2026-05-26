"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { SubscriptionCard } from "@/components/shared/subscription-card";
import { Loader2, CheckCircle, ArrowUpCircle, ChevronDown, Star, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Plan {
  id: number;
  name: string;
  display_name: string;
  tagline: string | null;
  tier: number;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  monthly_credits: number;
  first_purchase_discount: number;
  overage_rate_multiplier: number;
  max_concurrency: number;
  route_priority: string;
  off_peak_discount: number;
  support_level: string;
  popular: number;
  models: string[];
}

interface ActiveSubscription {
  plan_id: number;
  plan_tier: number;
}

export default function TokenPlanPage() {
  const { lang } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const { toast: showToast } = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [displayCurrency, setDisplayCurrency] = useState<string>("CNY");
  const [exchangeRate, setExchangeRate] = useState(7.3);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [activeSub, setActiveSub] = useState<ActiveSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planRes, settingsRes, subRes] = await Promise.all([
          fetch("/api/plans", { credentials: "include" }),
          fetch("/api/dashboard/settings", { credentials: "include" }),
          fetch("/api/dashboard/subscription", { credentials: "include" }),
        ]);
        if (cancelled) return;

        const planData = planRes.ok ? await planRes.json().catch(() => ({})) : { plans: [] };
        const settingsData = settingsRes.ok ? await settingsRes.json().catch(() => ({})) : {};
        const subData = subRes.ok ? await subRes.json().catch(() => ({})) : {};

        setPlans(planData.plans || []);
        if (settingsData.settings) {
          const rate = settingsData.settings.exchange_rate;
          if (rate) setExchangeRate(parseFloat(rate) || 7.3);
          const cur = settingsData.settings.currency;
          if (cur) setDisplayCurrency(cur || "CNY");
        }
        const active = subData.subscriptions?.find((s: { status: string }) => s.status === "active");
        if (active) {
          setActiveSub({ plan_id: active.plan_id, plan_tier: active.plan_tier || 0 });
        }
      } catch (err) {
        console.error("TokenPlan load error:", err);
        showToast("Failed to load plans", "error");
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleSubscribe(planId: number) {
    if (!user) { router.push("/register"); return; }
    setSubscribing(planId);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan_id: planId, billing_cycle: billingCycle }),
      });
      const data = await res.json();
      if (res.ok) {
        const action = data.action === "upgrade" ? (lang === "zh" ? "升级成功！" : "Upgraded!") :
                       data.action === "downgrade" ? (lang === "zh" ? "降级成功！" : "Downgraded!") :
                       (lang === "zh" ? "订阅成功！" : "Subscribed!");
        showToast(action, "success");
        router.replace("/dashboard/token-plan");
      } else {
        showToast(data.error || (lang === "zh" ? "订阅失败" : "Failed"), "error");
      }
    } catch { showToast(lang === "zh" ? "网络错误" : "Network error", "error"); }
    finally { setSubscribing(null); }
  }

  function getPlanAction(plan: Plan) {
    if (!activeSub) return { type: "subscribe" as const, label: lang === "zh" ? "立即订阅" : "Subscribe", disabled: false };
    if (activeSub.plan_id === plan.id) return { type: "current" as const, label: lang === "zh" ? "当前套餐" : "Current Plan", disabled: true };
    if (plan.tier > activeSub.plan_tier) return { type: "upgrade" as const, label: lang === "zh" ? "升级套餐" : "Upgrade", disabled: false };
    return { type: "downgrade" as const, label: lang === "zh" ? "切换套餐" : "Switch Plan", disabled: false };
  }

  // Public site stats for trust bar
  const { data: siteStats } = useSWR("/api/stats", fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: 60000 });
  const { data: healthData } = useSWR("/api/health", fetcher, { revalidateOnFocus: false, revalidateOnReconnect: false, refreshInterval: 60000 });
  const totalCalls = siteStats?.totalCalls ?? 0;
  const totalModels = siteStats?.totalModels ?? 0;
  const activeUsers = healthData?.active_users_24h ?? 0;

  // Scroll reveal via IntersectionObserver
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const setSectionRef = useCallback((el: HTMLElement | null) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  }, []);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("section-visible");
          }
        });
      },
      { threshold: 0.08 }
    );
    sectionRefs.current.forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [plans]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, var(--background) 0%, color-mix(in srgb, var(--background) 97%, var(--primary)) 100%)" }}>
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-skeleton {
          position: relative;
          overflow: hidden;
        }
        .shimmer-skeleton::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: shimmer-slide 2s infinite;
          pointer-events: none;
        }
        @keyframes animate-fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: animate-fadeIn 0.5s ease-out both;
        }
        @keyframes hero-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes banner-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes faq-expand {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 300px; }
        }
        .faq-content {
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          max-height: 0;
          opacity: 0;
        }
        details[open] .faq-content {
          max-height: 300px;
          opacity: 1;
        }
        .hover-col:hover {
          background: rgba(128,128,128,0.04);
        }
        @keyframes slide-indicator {
          from { left: var(--from-x); }
          to { left: var(--to-x); }
        }
        .section-hidden {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .section-visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* Header — Enhanced Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/8 rounded-full blur-3xl animate-[hero-float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl animate-[hero-float_10s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/3 left-1/2 w-48 h-48 bg-emerald-500/8 rounded-full blur-3xl animate-[hero-float_7s_ease-in-out_infinite_0.5s]" />
        </div>
        {/* Wide horizontal glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-r from-primary/[0.06] via-primary/[0.08] to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 py-14 lg:py-20 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-muted-foreground mb-3">
            {lang === "zh" ? "选择你的 Token Plan" : "Choose Your Token Plan"}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-3 max-w-md mx-auto transition-all font-medium">
            {billingCycle === "monthly"
              ? (lang === "zh" ? "按月订阅，灵活自由" : "Monthly, cancel anytime")
              : (lang === "zh" ? "年度优选，立省 12%" : "Yearly plan, save 12%")}
          </p>

          {/* Trust bar — real data */}
          {totalCalls > 0 && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground/80 mb-8 animate-fadeIn">
              <Activity className="h-3.5 w-3.5" />
              <span className="text-xs sm:text-sm tracking-wide font-medium">
                {lang === "zh"
                  ? `已处理 ${totalCalls.toLocaleString()} 次调用 · ${totalModels}+ 模型 · ${activeUsers} 位活跃开发者`
                  : `${totalCalls.toLocaleString()} calls · ${totalModels}+ models · ${activeUsers} active devs`}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            {/* Billing cycle toggle with sliding indicator */}
            <div className="relative inline-flex items-center gap-1 p-1 bg-muted rounded-full">
              <div
                className="absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full bg-background shadow-sm transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${billingCycle === "yearly" ? "100%" : "0%"})` }}
              />
              <button onClick={() => setBillingCycle("monthly")} className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {lang === "zh" ? "连续包月" : "Monthly"}
              </button>
              <button onClick={() => setBillingCycle("yearly")} className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors z-10 ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {lang === "zh" ? "连续包年" : "Yearly"}
              </button>
            </div>

            {/* Currency toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full">
              <button onClick={() => setDisplayCurrency("USD")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${displayCurrency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>$ USD</button>
              <button onClick={() => setDisplayCurrency("CNY")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${displayCurrency === "CNY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>¥ CNY</button>
            </div>

            {/* First purchase banner with subtle pulse */}
            <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-4 py-1.5 animate-[banner-pulse_3s_ease-in-out_infinite]">
              <Sparkles className="h-3 w-3 text-amber-400" />
              {lang === "zh" ? "首购特惠：首个订阅周期享 7 折" : "First purchase: 30% off first billing cycle"}
            </div>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section ref={setSectionRef} className="relative mx-auto max-w-6xl px-4 py-10 section-hidden">
        {/* Background radial glow behind card grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[150px] opacity-[0.04] dark:opacity-[0.03]" style={{ background: "radial-gradient(ellipse at center, var(--plan-pulse-from) 0%, transparent 70%)" }} />
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="shimmer-skeleton rounded-xl bg-card/40 border border-border/30">
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-muted" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 bg-muted rounded w-3/5" />
                      <div className="h-2.5 bg-muted rounded w-2/5" />
                    </div>
                  </div>
                  <div className="h-10 bg-muted rounded w-2/5" />
                  <div className="h-3 bg-muted rounded w-3/5" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-4/5" />
                    <div className="h-3 bg-muted rounded w-3/5" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-muted rounded-lg mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, i) => {
              const action = getPlanAction(plan);
              return (
                <div key={plan.id} className="animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <SubscriptionCard
                  plan={plan}
                  lang={lang}
                  variant="select"
                  billingCycle={billingCycle}
                  displayCurrency={displayCurrency}
                  exchangeRate={exchangeRate}
                >
                  <Button
                    className={cn(
                      "w-full",
                      action.type === "current" && "border-2 border-foreground/30 font-semibold",
                    )}
                    variant={action.type === "current" ? "outline" : "default"}
                    style={action.type !== "current" ? {
                      background: `linear-gradient(135deg, var(--plan-${plan.name}-from), var(--plan-${plan.name}-to))`,
                      color: "#fff",
                    } : {}}
                    onClick={(e) => { e.stopPropagation(); handleSubscribe(plan.id); }}
                    disabled={subscribing === plan.id || action.disabled}
                  >
                    {subscribing === plan.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />{lang === "zh" ? "处理中..." : "Processing..."}</>
                    ) : action.type === "current" ? (
                      <><CheckCircle className="h-4 w-4 mr-1.5" />{action.label}</>
                    ) : action.type === "upgrade" ? (
                      <><ArrowUpCircle className="h-4 w-4 mr-1.5" />{action.label}</>
                    ) : (
                      action.label
                    )}
                  </Button>
                </SubscriptionCard>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Comparison Table */}
      {plans.length > 0 && (
        <section ref={setSectionRef} className="relative border-t border-border section-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.015] via-transparent to-transparent pointer-events-none" />
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h2 className="text-lg font-semibold text-foreground text-center mb-6">
              {lang === "zh" ? "套餐对比" : "Compare Plans"}
            </h2>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3.5 text-muted-foreground font-medium whitespace-nowrap w-44">
                      {lang === "zh" ? "功能特性" : "Feature"}
                    </th>
                    {plans.map((plan) => {
                      const thClass = `gradient-${plan.name}`;
                      const isPop = plan.popular === 1;
                      return (
                        <th key={plan.id} className={`p-3.5 text-center font-semibold whitespace-nowrap text-white ${thClass}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            {plan.display_name}
                            {isPop && <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr className="transition-colors hover:bg-muted/15">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "每月 Credits" : "Monthly Credits"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3 text-center whitespace-nowrap font-mono font-semibold">{p.monthly_credits.toLocaleString()}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/15">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "最大并发" : "Max Concurrency"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3 text-center whitespace-nowrap">{p.max_concurrency}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/15">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "路由优先级" : "Route Priority"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3 text-center whitespace-nowrap capitalize">{p.route_priority}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/15">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "支持等级" : "Support Level"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3 text-center whitespace-nowrap">{p.support_level === "dedicated" ? (lang === "zh" ? "专属客服" : "Dedicated") : p.support_level === "priority" ? (lang === "zh" ? "优先" : "Priority") : p.support_level === "email" ? (lang === "zh" ? "邮件" : "Email") : (lang === "zh" ? "社区" : "Community")}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/15">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "非高峰折扣" : "Off-Peak Discount"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3 text-center whitespace-nowrap">{(p.off_peak_discount * 100).toFixed(0)}%</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/15 border-t-2 border-border/40">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "月付价格" : "Monthly Price"}</td>
                    {plans.map((p) => {
                      const needsConversion = displayCurrency !== p.currency;
                      const price = needsConversion && displayCurrency === "CNY" ? p.monthly_price * exchangeRate : needsConversion && displayCurrency === "USD" ? p.monthly_price / exchangeRate : p.monthly_price;
                      const sym = displayCurrency === "CNY" ? "¥" : "$";
                      return <td key={p.id} className="p-3 text-center whitespace-nowrap font-mono font-bold" style={{ color: `var(--plan-${p.name}-from)` }}>{sym}{price.toFixed(2)}</td>;
                    })}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/15">
                    <td className="p-3 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "年付价格" : "Yearly Price"}</td>
                    {plans.map((p) => {
                      const needsConversion = displayCurrency !== p.currency;
                      const price = needsConversion && displayCurrency === "CNY" ? p.yearly_price * exchangeRate : needsConversion && displayCurrency === "USD" ? p.yearly_price / exchangeRate : p.yearly_price;
                      const sym = displayCurrency === "CNY" ? "¥" : "$";
                      return <td key={p.id} className="p-3 text-center whitespace-nowrap font-mono font-bold" style={{ color: `var(--plan-${p.name}-from)` }}>{sym}{price.toFixed(2)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tools — Card-style blocks */}
      <section ref={setSectionRef} className="relative border-t border-border bg-muted/20 section-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {lang === "zh" ? "兼容主流编程工具" : "Compatible with Popular Coding Tools"}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: "VS Code", icon: "🔧" },
              { name: "Cursor", icon: "✏️" },
              { name: "JetBrains", icon: "🧩" },
              { name: "Continue", icon: "🔌" },
              { name: "Cline", icon: "💻" },
              { name: "OpenAI SDK", icon: "🤖" },
              { name: "LangChain", icon: "⛓️" },
            ].map((t) => (
              <span key={t.name} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm text-xs text-muted-foreground transition-all hover:border-border hover:bg-card hover:scale-105 hover:shadow-sm cursor-default">
                <span className="text-[11px]">{t.icon}</span>
                {t.name}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-4">
            {lang === "zh" ? "统一 API 端点，兼容 OpenAI / Anthropic 格式，一行代码切换" : "Unified API endpoint. OpenAI / Anthropic compatible, one-line config"}
          </p>
        </div>
      </section>

      {/* FAQ — Accordion */}
      <section ref={setSectionRef} className="relative border-t border-border section-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        {/* Center focal glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[100px] pointer-events-none" />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-lg font-semibold text-foreground text-center mb-6">
            {lang === "zh" ? "常见问题" : "FAQ"}
          </h2>
          <div className="space-y-2">
            {(lang === "zh" ? [
              { q: "Credits 耗尽后还能继续调用吗？", a: "可以。系统会自动从账户余额按量扣费，享受当前套餐折扣系数。余额不足时返回 402 错误并通知充值。" },
              { q: "中途可以升级套餐吗？", a: "可以。升级按剩余天数折算差价立即生效，降级在当前周期结束后生效。" },
              { q: "首购优惠如何使用？", a: "首次订阅自动享受 77 折，无需优惠码，仅限首个订阅周期。" },
              { q: "什么是 Overage Rate Multiplier？", a: "当套餐 Credits 耗尽后，系统会按当前套餐的倍率系数从余额扣费。不同套餐的倍率不同，等级越高倍率越低。" },
            ] : [
              { q: "Can I still call after credits run out?", a: "Yes. The system auto-deducts from your balance with your plan's discount rate. Returns 402 if balance is insufficient." },
              { q: "Can I upgrade mid-cycle?", a: "Yes. Upgrades take effect immediately with prorated pricing. Downgrades take effect at end of current period." },
              { q: "How does first purchase discount work?", a: "Your first subscription automatically gets 23% off. No promo code needed. First billing cycle only." },
              { q: "What is Overage Rate Multiplier?", a: "When plan credits are exhausted, the system deducts from your balance at the plan's overage rate multiplier. Higher tier plans have lower multipliers." },
            ]).map((item, i) => (
              <details key={i} className="group rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm transition-all hover:border-muted-foreground/30 hover:shadow-sm [&[open]]:border-primary/30 [&[open]]:shadow-md">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-foreground list-none">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="faq-content">
                  <div className="px-4 pb-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section ref={setSectionRef} className="relative border-t border-border section-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        <div className="mx-auto max-w-2xl px-4 py-12 text-center">
          <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              {lang === "zh" ? "还有疑问？" : "Still have questions?"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {lang === "zh" ? "我们的团队随时为你解答套餐、计费和技术问题" : "Our team is here to help with plans, billing, and technical questions"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/docs">
                <Button variant="outline" size="sm">{lang === "zh" ? "查看文档" : "View Docs"}</Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button size="sm">{lang === "zh" ? "联系销售" : "Contact Sales"}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
