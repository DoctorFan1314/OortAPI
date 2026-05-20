"use client";

import { Cpu, Route, DollarSign, Shield, Gauge, Layers } from "lucide-react";

const FEATURES_EN = [
  { icon: Cpu, title: "Unified Interface", desc: "One API endpoint for all AI services. OpenAI-compatible format — use any SDK." },
  { icon: Route, title: "Smart Routing", desc: "Multi-channel load balancing, automatic failover, weighted distribution." },
  { icon: DollarSign, title: "Fine-grained Billing", desc: "Per-token billing, prepaid balance, cache discounts, multi-rate config." },
  { icon: Shield, title: "Security & Access Control", desc: "Per-key model permissions, rate limiting, complete audit logging." },
  { icon: Gauge, title: "Real-time Monitoring", desc: "Live dashboard, usage analytics, cost breakdown, latency tracking." },
  { icon: Layers, title: "Multi-tenant", desc: "Individual devs, teams, and enterprise deployments — all supported." },
];

const FEATURES_ZH = [
  { icon: Cpu, title: "统一接口", desc: "一个 API 端点接入所有 AI 服务，兼容 OpenAI 标准格式，直接使用任何 SDK。" },
  { icon: Route, title: "智能路由", desc: "多渠道负载均衡、故障自动切换、加权随机分发。" },
  { icon: DollarSign, title: "精细计费", desc: "按 Token 计费、预付费充值、缓存折扣、多倍率配置。" },
  { icon: Shield, title: "安全管控", desc: "每个 Key 可设置模型范围、速率限制、完整调用审计日志。" },
  { icon: Gauge, title: "实时监控", desc: "实时数据看板、用量分析、成本拆解、延迟追踪。" },
  { icon: Layers, title: "多租户架构", desc: "完美适配个人开发者、团队协作与企业级部署。" },
];

export function Features({ lang = "zh" }: { lang?: "zh" | "en" }) {
  const features = lang === "zh" ? FEATURES_ZH : FEATURES_EN;

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {lang === "zh" ? "核心功能" : "Core Features"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {lang === "zh"
              ? "为 AI 应用提供统一的基础设施，让开发者专注于业务逻辑"
              : "Unified infrastructure for AI applications — so developers can focus on business logic"
            }
          </p>
        </div>
        {/* Clean 3-column grid, 2 rows — perfectly balanced */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card glass-card-hover p-6 rounded-xl group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
