"use client";

import { Cpu, Route, DollarSign, Shield, Gauge, Layers } from "lucide-react";

function RoutingFlow() {
  return (
    <svg className="w-full h-10 mt-2" viewBox="0 0 280 40" fill="none">
      <rect x="0" y="10" width="56" height="20" rx="4" className="fill-primary/20 stroke-primary/40" strokeWidth="1" />
      <text x="8" y="23" className="text-[9px] fill-foreground font-mono">用户请求</text>
      <line x1="58" y1="20" x2="82" y2="20" className="stroke-muted-foreground/30 flow-line" strokeWidth="1.5" />
      <rect x="84" y="8" width="64" height="24" rx="4" className="fill-emerald-500/15 stroke-emerald-500/40" strokeWidth="1" />
      <text x="94" y="22" className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-mono">路由网关</text>
      <line x1="150" y1="16" x2="168" y2="16" className="stroke-muted-foreground/30 flow-line" strokeWidth="1.5" />
      <line x1="150" y1="24" x2="168" y2="24" className="stroke-muted-foreground/30 flow-line" strokeWidth="1.5" />
      <rect x="170" y="0" width="48" height="16" rx="3" className="fill-blue-500/15 stroke-blue-500/40" strokeWidth="1" />
      <text x="175" y="11" className="text-[8px] fill-blue-600 dark:fill-blue-400 font-mono">上游A</text>
      <rect x="170" y="12" width="48" height="16" rx="3" className="fill-purple-500/15 stroke-purple-500/40" strokeWidth="1" />
      <text x="175" y="23" className="text-[8px] fill-purple-600 dark:fill-purple-400 font-mono">上游B</text>
      <rect x="170" y="24" width="48" height="16" rx="3" className="fill-cyan-500/15 stroke-cyan-500/40" strokeWidth="1" />
      <text x="175" y="35" className="text-[8px] fill-cyan-600 dark:fill-cyan-400 font-mono">上游C</text>
    </svg>
  );
}

function CacheFlow() {
  return (
    <svg className="w-full h-10 mt-2" viewBox="0 0 280 40" fill="none">
      <rect x="0" y="10" width="56" height="20" rx="4" className="fill-primary/20 stroke-primary/40" strokeWidth="1" />
      <text x="8" y="23" className="text-[9px] fill-foreground font-mono">请求</text>
      <line x1="58" y1="20" x2="74" y2="20" className="stroke-emerald-400 flow-line-fast" strokeWidth="1.5" />
      <rect x="76" y="4" width="48" height="16" rx="3" className="fill-amber-500/15 stroke-amber-500/40" strokeWidth="1" />
      <text x="81" y="15" className="text-[8px] fill-amber-600 dark:fill-amber-400 font-mono">缓存L1</text>
      <rect x="76" y="20" width="48" height="16" rx="3" className="fill-orange-500/15 stroke-orange-500/40" strokeWidth="1" />
      <text x="81" y="31" className="text-[8px] fill-orange-600 dark:fill-orange-400 font-mono">缓存L2</text>
      <line x1="126" y1="12" x2="144" y2="12" className="stroke-emerald-400 flow-line-fast" strokeWidth="1.5" />
      <line x1="126" y1="28" x2="144" y2="28" className="stroke-muted-foreground/30 flow-line" strokeWidth="1" />
      <rect x="146" y="10" width="48" height="20" rx="4" className="fill-emerald-500/15 stroke-emerald-500/40" strokeWidth="1" />
      <text x="155" y="23" className="text-[9px] fill-emerald-600 dark:fill-emerald-400 font-mono">命中✓</text>
      <line x1="196" y1="20" x2="214" y2="20" className="stroke-muted-foreground/30 flow-line" strokeWidth="1" />
      <rect x="216" y="10" width="48" height="20" rx="4" className="fill-muted stroke-muted-foreground/40" strokeWidth="1" />
      <text x="226" y="23" className="text-[9px] fill-muted-foreground font-mono">模型</text>
    </svg>
  );
}

const LARGE_FEATURES = [
  {
    icon: Route,
    titleKey: "智能路由",
    titleEn: "Smart Routing",
    descZh: "多渠道负载均衡、故障自动切换、加权随机分发。连续 3 次失败自动降级。",
    descEn: "Multi-channel load balancing, automatic failover, weighted distribution. Auto-degrade after 3 consecutive failures.",
    Flow: RoutingFlow,
  },
  {
    icon: DollarSign,
    titleKey: "三级缓存计费",
    titleEn: "3-Tier Cache Billing",
    descZh: "输入(缓存)享 50% 折扣，三级缓存感知计费，大幅降低推理成本。",
    descEn: "Cache-hit input at 50% discount. 3-tier cache-aware billing slashes inference costs.",
    Flow: CacheFlow,
  },
];

const SMALL_FEATURES = [
  { icon: Cpu, titleZh: "统一接口", titleEn: "Unified Interface", descZh: "一个 API 端点接入所有 AI 服务，兼容 OpenAI 标准格式。", descEn: "One endpoint for all AI services. OpenAI-compatible format." },
  { icon: Shield, titleZh: "安全管控", titleEn: "Security", descZh: "每个 Key 可设置模型范围、速率限制、审计日志。", descEn: "Per-key model permissions, rate limiting, audit logs." },
  { icon: Gauge, titleZh: "实时监控", titleEn: "Monitoring", descZh: "实时看板、用量分析、成本拆解、延迟追踪。", descEn: "Live dashboard, usage analytics, cost breakdown." },
  { icon: Layers, titleZh: "多租户架构", titleEn: "Multi-tenant", descZh: "适配个人开发者、团队与企业级部署。", descEn: "Individual devs, teams, enterprise deployments." },
];

export function Features({ lang = "zh" }: { lang?: "zh" | "en" }) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">
            {lang === "zh" ? "核心功能" : "Core Features"}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            {lang === "zh"
              ? "为 AI 应用提供统一的基础设施"
              : "Unified infrastructure for AI applications"}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Large feature cards — col-span-2 row-span-2 */}
          {LARGE_FEATURES.map((f, i) => (
            <div
              key={i}
              className="col-span-2 row-span-2 glass-card p-5 rounded-xl group transition-all duration-500 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/[0.08] hover:scale-[1.01]"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-base mb-1.5">
                {lang === "zh" ? f.titleKey : f.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                {lang === "zh" ? f.descZh : f.descEn}
              </p>
              <f.Flow />
            </div>
          ))}

          {/* Small feature cards */}
          {SMALL_FEATURES.map((f, i) => (
            <div
              key={i}
              className="glass-card p-4 rounded-xl group transition-all duration-500 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-primary/[0.08] hover:scale-[1.01]"
              style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm mb-1">
                {lang === "zh" ? f.titleZh : f.titleEn}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lang === "zh" ? f.descZh : f.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
