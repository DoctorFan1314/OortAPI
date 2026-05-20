"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { SubscriptionCard } from "@/components/shared/subscription-card";
import { Loader2, CheckCircle, ArrowUpCircle, ChevronDown, Star } from "lucide-react";

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
    Promise.all([
      fetch("/api/plans").then(r => r.json()),
      fetch("/api/dashboard/settings").then(r => r.json()).catch(() => ({})),
      fetch("/api/dashboard/subscription", { credentials: "include" }).then(r => r.json()).catch(() => ({})),
    ]).then(([planData, settingsData, subData]) => {
      setPlans(planData.plans || []);
      if (settingsData.settings) {
        const rate = settingsData.settings.find((s: { key: string }) => s.key === "exchange_rate");
        if (rate) setExchangeRate(parseFloat(rate.value) || 7.3);
        const cur = settingsData.settings.find((s: { key: string }) => s.key === "currency");
        if (cur) setDisplayCurrency(cur.value || "CNY");
      }
      const active = subData.subscriptions?.find((s: { status: string }) => s.status === "active");
      if (active) {
        setActiveSub({ plan_id: active.plan_id, plan_tier: active.plan_tier || 0 });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header — Enhanced Hero */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Decorative orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-12 lg:py-16 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text mb-3 animate-fadeIn">
            {lang === "zh" ? "选择你的 Token Plan" : "Choose your Token Plan"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto animate-fadeIn">
            {lang === "zh" ? "根据你的使用需求，选择最适合的套餐方案" : "Select the best plan for your usage needs"}
          </p>

          <div className="flex flex-col items-center gap-3">
            {/* Billing cycle toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full hero-animate-1">
              <button onClick={() => setBillingCycle("monthly")} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {lang === "zh" ? "连续包月" : "Monthly"}
              </button>
              <button onClick={() => setBillingCycle("yearly")} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                {lang === "zh" ? "连续包年" : "Yearly"}
                <span className="ml-1.5 text-xs text-amber-400 font-semibold">{lang === "zh" ? "省12%" : "Save 12%"}</span>
              </button>
            </div>

            {/* Currency toggle */}
            <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full hero-animate-2">
              <button onClick={() => setDisplayCurrency("USD")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${displayCurrency === "USD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>$ USD</button>
              <button onClick={() => setDisplayCurrency("CNY")} className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${displayCurrency === "CNY" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>¥ CNY</button>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-[420px] bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const action = getPlanAction(plan);
              return (
                <SubscriptionCard
                  key={plan.id}
                  plan={plan}
                  lang={lang}
                  variant="select"
                  billingCycle={billingCycle}
                  displayCurrency={displayCurrency}
                  exchangeRate={exchangeRate}
                >
                  <Button
                    className="w-full"
                    variant={action.type === "current" ? "outline" : action.type === "upgrade" ? "default" : "default"}
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
              );
            })}
          </div>
        )}
      </section>

      {/* Comparison Table */}
      {plans.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-10">
            <h2 className="text-lg font-semibold text-foreground text-center mb-6">
              {lang === "zh" ? "套餐对比" : "Compare Plans"}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-3.5 bg-muted/50 text-muted-foreground font-medium whitespace-nowrap">
                      {lang === "zh" ? "功能" : "Feature"}
                    </th>
                    {plans.map((plan) => {
                      const thClass = `gradient-${plan.name}`;
                      return (
                        <th key={plan.id} className={`p-3.5 text-center font-semibold whitespace-nowrap text-white ${thClass}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            {plan.display_name}
                            {plan.popular === 1 && <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-card">
                  <tr className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "每月 Credits" : "Monthly Credits"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3.5 text-center whitespace-nowrap font-mono font-semibold">{p.monthly_credits.toLocaleString()}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "最大并发" : "Max Concurrency"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3.5 text-center whitespace-nowrap">{p.max_concurrency}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "路由优先级" : "Route Priority"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3.5 text-center whitespace-nowrap capitalize">{p.route_priority}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "支持等级" : "Support Level"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3.5 text-center whitespace-nowrap">{p.support_level === "dedicated" ? (lang === "zh" ? "专属客服" : "Dedicated") : p.support_level === "priority" ? (lang === "zh" ? "优先" : "Priority") : p.support_level === "email" ? (lang === "zh" ? "邮件" : "Email") : (lang === "zh" ? "社区" : "Community")}</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "非高峰折扣" : "Off-Peak Discount"}</td>
                    {plans.map((p) => <td key={p.id} className="p-3.5 text-center whitespace-nowrap">{(p.off_peak_discount * 100).toFixed(0)}%</td>)}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/30 border-t-2 border-border/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "月付价格" : "Monthly Price"}</td>
                    {plans.map((p) => {
                      const needsConversion = displayCurrency !== p.currency;
                      const price = needsConversion && displayCurrency === "CNY" ? p.monthly_price * exchangeRate
                                  : needsConversion && displayCurrency === "USD" ? p.monthly_price / exchangeRate
                                  : p.monthly_price;
                      const sym = displayCurrency === "CNY" ? "¥" : "$";
                      return <td key={p.id} className="p-3.5 text-center whitespace-nowrap font-mono font-bold">{sym}{price.toFixed(2)}</td>;
                    })}
                  </tr>
                  <tr className="transition-colors hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap font-medium">{lang === "zh" ? "年付价格" : "Yearly Price"}</td>
                    {plans.map((p) => {
                      const needsConversion = displayCurrency !== p.currency;
                      const price = needsConversion && displayCurrency === "CNY" ? p.yearly_price * exchangeRate
                                  : needsConversion && displayCurrency === "USD" ? p.yearly_price / exchangeRate
                                  : p.yearly_price;
                      const sym = displayCurrency === "CNY" ? "¥" : "$";
                      return <td key={p.id} className="p-3.5 text-center whitespace-nowrap font-mono font-bold text-primary">{sym}{price.toFixed(2)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Tools */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {lang === "zh" ? "兼容主流编程工具" : "Compatible with Popular Coding Tools"}
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {["VS Code", "Cursor", "JetBrains", "Continue", "Cline", "OpenAI SDK", "LangChain"].map((t) => (
              <span key={t} className="px-3 py-1 rounded-md border border-border bg-card text-xs text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — Accordion */}
      <section className="border-t border-border">
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
              <details key={i} className="group rounded-lg border border-border bg-card transition-colors hover:border-muted-foreground/30 [&[open]]:border-primary/30">
                <summary className="flex items-center justify-between p-4 cursor-pointer text-sm font-medium text-foreground list-none">
                  {item.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-4 pb-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
