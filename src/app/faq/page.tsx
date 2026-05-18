"use client";

import { useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: Record<string, FaqItem[]> = {
  zh: [
    { q: "OortAPI 支持哪些 AI 模型？", a: "OortAPI 支持 OpenAI（GPT-4o、GPT-4 Turbo、GPT-3.5）、Anthropic（Claude 4 Sonnet、Claude 4 Opus）、Google（Gemini 系列）、DeepSeek、阿里云（Qwen）等 30+ AI 模型。你可以在「模型市场」查看完整列表和实时定价。" },
    { q: "如何获取 API Key？", a: "注册并登录后，进入「控制台 → API Keys」，点击创建即可生成 API Key。你的 Key 以 sk-oort- 开头。请妥善保管，页面关闭后无法再次查看完整 Key。" },
    { q: "余额如何扣除？计费方式是什么？", a: "每次 API 调用后自动从余额扣除，费率取决于所用模型。我们采用三级缓存感知定价：输入 Token、输出 Token、缓存读取（更便宜）和缓存创建。具体费率可在「模型市场」查看。" },
    { q: "余额不足时会怎样？", a: "余额不足时 API 会返回 402 状态码，提示余额不足。你需要通过兑换码或联系管理员充值。目前充值按钮尚在开发中，请使用兑换码充值。" },
    { q: "什么是兑换码？如何获取？", a: "兑换码是管理员批量生成的充值码，格式为 RC-XXXXXXXX。你可以在「账单中心」兑换。兑换码通常由管理员发放。" },
    { q: "支持哪些 API 协议？", a: "同时兼容 OpenAI 格式（/api/v1/*）和 Anthropic 格式（/api/*）。大多数 AI 客户端使用 OpenAI 兼容协议。两个协议使用同一个 API Key。" },
    { q: "速率限制是多少？", a: "默认每分钟 60 次请求（60 RPM），可在控制台 API Keys 页面调整。超过限制会返回 429 状态码。" },
    { q: "如何查看调用历史？", a: "进入「控制台 → 调用日志」，可查看详细的 API 调用记录，包括模型、Token 用量、费用、延迟等信息。支持按模型、状态、日期和 API Key 筛选。" },
    { q: "支持哪些 SDK？", a: "支持所有 OpenAI SDK（Python、Node.js、Go、Java 等）和 Anthropic SDK，只需修改 Base URL 和 API Key 即可。此外还兼容 LangChain、Vercel AI SDK、LlamaIndex 等框架。" },
    { q: "什么是倍率系统？", a: "倍率系统允许管理员为不同模型设置定价倍率，支持常规倍率（按模型固定）和时段倍率（白天/夜间不同）。最终价格 = 基础费率 × 倍率。" },
  ],
  en: [
    { q: "What AI models does OortAPI support?", a: "OortAPI supports 30+ AI models including OpenAI (GPT-4o, GPT-4 Turbo, GPT-3.5), Anthropic (Claude 4 Sonnet, Claude 4 Opus), Google (Gemini), DeepSeek, Alibaba (Qwen), and more. Visit the Model Market for the full list and real-time pricing." },
    { q: "How do I get an API Key?", a: "After registering, go to Dashboard > API Keys and click Create. Your key starts with sk-oort-. Save it immediately — you won't be able to see the full key again after closing the page." },
    { q: "How does billing work?", a: "Your balance is auto-deducted after each API call. Rates depend on the model used. We use 3-tier pricing: Input(non-cached), Input(cache hit), Output. Cache-hit tokens enjoy a lower rate. See per-model rates in the Model Market." },
    { q: "What happens when my balance runs out?", a: "The API returns a 402 status code. You'll need a redeem code or admin top-up to continue. Direct recharge is coming soon — please use redeem codes for now." },
    { q: "What are redeem codes?", a: "Redeem codes are batch-generated top-up codes (format: RC-XXXXXXXX) created by admins. Redeem them in the Billing Center. Codes are typically distributed by administrators." },
    { q: "Which API protocols are supported?", a: "Both OpenAI format (/api/v1/*) and Anthropic format (/api/*) are supported. Most AI clients use the OpenAI-compatible protocol. Both protocols use the same API Key." },
    { q: "What is the rate limit?", a: "Default is 60 requests per minute (60 RPM), adjustable per key in the Dashboard > API Keys. Exceeding the limit returns a 429 status code." },
    { q: "How do I view my usage history?", a: "Go to Dashboard > Call Logs to view detailed API call records including model, token usage, cost, latency, and more. Supports filtering by model, status, date, and API Key." },
    { q: "Which SDKs are supported?", a: "All OpenAI SDKs (Python, Node.js, Go, Java, etc.) and Anthropic SDKs work — just change the Base URL and API Key. Also compatible with LangChain, Vercel AI SDK, LlamaIndex, and more." },
    { q: "What is the multiplier system?", a: "The multiplier system lets admins set pricing multipliers per model, supporting regular (fixed per-model) and time-based (day/night) rates. Final price = base rate × multiplier." },
  ],
};

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            <span>{item.q}</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground shrink-0 transition-transform", openIndex === i && "rotate-180")} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="px-4 pb-3 text-sm text-muted-foreground leading-relaxed">
              {item.a}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FaqPage() {
  const { lang } = useI18n();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HelpCircle className="h-6 w-6" />
        {lang === "zh" ? "常见问题" : "FAQ"}
      </h1>
      <p className="text-sm text-muted-foreground">
        {lang === "zh" ? "关于 OortAPI 的常见问题解答。" : "Frequently asked questions about OortAPI."}
      </p>
      <Card className="glass-card">
        <CardContent className="p-4">
          <FaqAccordion items={FAQS[lang]} />
        </CardContent>
      </Card>
    </div>
  );
}
