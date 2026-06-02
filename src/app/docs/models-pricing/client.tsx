"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { CrossLinks } from "@/components/docs/cross-links";
import { Cpu, ExternalLink, ArrowRight, Info, Zap, DollarSign, Database } from "lucide-react";

const POPULAR_MODELS = [
  { provider: "OpenAI", name: "gpt-4o", context: "128K", input: "¥0.018", output: "¥0.072", cache: "¥0.0045" },
  { provider: "OpenAI", name: "gpt-4o-mini", context: "128K", input: "¥0.001", output: "¥0.004", cache: "¥0.00025" },
  { provider: "Anthropic", name: "claude-sonnet-4-20250514", context: "200K", input: "¥0.021", output: "¥0.105", cache: "¥0.0021" },
  { provider: "Anthropic", name: "claude-haiku-4-20250414", context: "200K", input: "¥0.006", output: "¥0.03", cache: "¥0.0006" },
  { provider: "Google", name: "gemini-2.5-flash", context: "1M", input: "¥0.0009", output: "¥0.0036", cache: "¥0.00009" },
  { provider: "DeepSeek", name: "deepseek-chat", context: "64K", input: "¥0.001", output: "¥0.002", cache: "¥0.0001" },
  { provider: "Qwen", name: "qwen-max", context: "32K", input: "¥0.016", output: "¥0.064", cache: "—" },
];

export function ModelsPricingContent() {
  const { lang } = useI18n();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{lang === "zh" ? "模型与定价" : "Models & Pricing"}</h1>
        <p className="text-muted-foreground">
          {lang === "zh" ? "OortAPI 聚合多家 AI 服务商，提供统一的 OpenAI / Anthropic 兼容接口。所有模型按实际 token 用量计费。" : "OortAPI aggregates multiple AI providers behind a unified OpenAI / Anthropic compatible interface. All models are billed by actual token usage."}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          {lang === "zh" ? "计费方式" : "How Pricing Works"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Zap, title: lang === "zh" ? "输入 Token" : "Input Tokens", desc: lang === "zh" ? "用户发送的消息内容" : "Messages you send to the model" },
            { icon: Zap, title: lang === "zh" ? "输出 Token" : "Completion Tokens", desc: lang === "zh" ? "模型生成的回复内容" : "Model-generated response content" },
            { icon: Database, title: lang === "zh" ? "缓存读取" : "Cache Read", desc: lang === "zh" ? "命中缓存的输入（更便宜）" : "Cache-hit input tokens (cheaper)" },
            { icon: Database, title: lang === "zh" ? "缓存写入" : "Cache Create", desc: lang === "zh" ? "首次写入缓存的输入" : "First-time cache write input" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-card rounded-xl p-4 border border-border/50">
                <Icon className="h-4 w-4 text-primary mb-2" />
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1.5 text-muted-foreground">
              <p>{lang === "zh" ? "系统自动选择最优计费方式，无需手动配置。" : "The system automatically selects the optimal billing method — no manual configuration needed."}</p>
              <p>{lang === "zh" ? "使用倍率系统：实际费用 = 模型基础价格 × 倍率。所有价格以人民币计价，按 token 计费。" : "Uses a multiplier system: actual cost = base model price × multiplier. All prices in CNY, billed per token."}</p>
              <p>{lang === "zh" ? "余额不足时，API 返回 402 Payment Required 错误。请及时充值。" : "When balance is insufficient, the API returns 402 Payment Required. Please top up in time."}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          {lang === "zh" ? "热门模型价格（每千 token）" : "Popular Models (per 1K tokens)"}
        </h2>
        <div className="rounded-xl border border-border/50 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/10 border-b border-border/20">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{lang === "zh" ? "服务商" : "Provider"}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{lang === "zh" ? "模型" : "Model"}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{lang === "zh" ? "上下文" : "Context"}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{lang === "zh" ? "输入" : "Input"}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{lang === "zh" ? "输出" : "Output"}</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{lang === "zh" ? "缓存读取" : "Cache Read"}</th>
              </tr>
            </thead>
            <tbody>
              {POPULAR_MODELS.map((model) => (
                <tr key={model.name} className="border-b border-border/20 last:border-b-0 hover:bg-muted/5 transition-colors">
                  <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{model.provider}</span></td>
                  <td className="px-4 py-3 font-mono text-xs font-medium">{model.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{model.context}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono">{model.input}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono">{model.output}</td>
                  <td className="px-4 py-3 text-xs text-right font-mono text-emerald-500">{model.cache}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          {lang === "zh" ? "以上为示例价格，实际价格以模型市场页面为准。" : "Prices shown are examples. Check the model marketplace for current rates."}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {lang === "zh" ? "通过 API 获取模型列表" : "Get Models via API"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh" ? "调用此接口获取所有可用模型及其定价信息：" : "Call this endpoint to get all available models and their pricing:"}
        </p>
        <CodeBlock examples={[
          { label: "cURL", code: `curl https://your-domain.com/api/v1/models \\\n  -H "Authorization: Bearer sk-oort-your-key"` },
          { label: "Python", code: `import openai\nclient = openai.OpenAI(\n    base_url="https://your-domain.com/api/v1",\n    api_key="sk-oort-your-key"\n)\nmodels = client.models.list()\nfor m in models.data:\n    print(m.id)` },
          { label: "Node.js", code: `import OpenAI from "openai";\nconst client = new OpenAI({\n    baseURL: "https://your-domain.com/api/v1",\n    apiKey: "sk-oort-your-key",\n});\nconst models = await client.models.list();\nmodels.data.forEach(m => console.log(m.id));` },
        ]} />
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/models" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          {lang === "zh" ? "浏览完整模型市场" : "Browse Full Model Marketplace"}<ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <Link href="/docs/pricing" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 text-sm font-medium hover:bg-muted/30 transition-colors">
          {lang === "zh" ? "查看详细定价规则" : "View Detailed Pricing Rules"}<ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <CrossLinks links={[
        { title: lang === "zh" ? "速率限制" : "Rate Limits", href: "/docs/rate-limits", description: lang === "zh" ? "了解请求频率限制与配额" : "Understand request frequency limits and quotas" },
        { title: lang === "zh" ? "API 端点" : "Endpoints", href: "/docs/endpoints", description: lang === "zh" ? "查看所有可用的 API 端点" : "View all available API endpoints" },
      ]} />
    </div>
  );
}
