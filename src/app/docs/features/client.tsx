"use client";

import Link from "next/link";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { CrossLinks } from "@/components/docs/cross-links";
import {
  Zap,
  Wrench,
  FileJson,
  Eye,
  Database,
  GitBranch,
  ArrowRight,
} from "lucide-react";

const streamingCode = `curl https://api.oortapi.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "gpt-4o",
    "stream": true,
    "stream_options": { "include_usage": true },
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'`;

const toolCallingCode = `curl https://api.oortapi.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "What is the weather in Tokyo?" }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the current weather for a city",
          "parameters": {
            "type": "object",
            "properties": {
              "city": { "type": "string", "description": "City name" }
            },
            "required": ["city"]
          }
        }
      }
    ]
  }'`;

const structuredOutputCode = `curl https://api.oortapi.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "gpt-4o",
    "response_format": { "type": "json_object" },
    "messages": [
      { "role": "system", "content": "Respond with valid JSON." },
      { "role": "user", "content": "List 3 programming languages with their year of creation." }
    ]
  }'`;

const visionCode = `curl https://api.oortapi.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "What is in this image?" },
          {
            "type": "image_url",
            "image_url": { "url": "https://example.com/photo.jpg" }
          }
        ]
      }
    ]
  }'`;

const promptCachingCode = `curl https://api.oortapi.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk-oort-your-key" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "system": [
      {
        "type": "text",
        "text": "You are a helpful assistant with a very long system prompt...",
        "cache_control": { "type": "ephemeral" }
      }
    ],
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'`;

interface FeatureSection {
  id: string;
  icon: React.ElementType;
  titleEn: string;
  titleZh: string;
  descEn: string;
  descZh: string;
  bulletsEn: string[];
  bulletsZh: string[];
  code: string;
  codeLang?: string;
}

const sections: FeatureSection[] = [
  {
    id: "streaming",
    icon: Zap,
    titleEn: "Streaming",
    titleZh: "流式输出",
    descEn: "OortAPI supports real-time streaming for both OpenAI and Anthropic protocols.",
    descZh: "OortAPI 同时支持 OpenAI 和 Anthropic 协议的实时流式输出。",
    bulletsEn: ["SSE (Server-Sent Events) format", "Use stream_options.include_usage for token counts", "Both OpenAI and Anthropic streaming protocols supported"],
    bulletsZh: ["SSE（Server-Sent Events）格式", "通过 stream_options.include_usage 获取 token 用量", "同时支持 OpenAI 和 Anthropic 流式协议"],
    code: streamingCode,
  },
  {
    id: "tool-calling",
    icon: Wrench,
    titleEn: "Function / Tool Calling",
    titleZh: "函数 / 工具调用",
    descEn: "Use tools and function calling through the relay — fully compatible with OpenAI and Anthropic tool formats.",
    descZh: "通过中继使用工具和函数调用 — 完全兼容 OpenAI 和 Anthropic 工具格式。",
    bulletsEn: ["Works with all compatible models", "Parallel tool calls supported"],
    bulletsZh: ["适用于所有兼容模型", "支持并行工具调用"],
    code: toolCallingCode,
  },
  {
    id: "structured-outputs",
    icon: FileJson,
    titleEn: "Structured Outputs / JSON Mode",
    titleZh: "结构化输出 / JSON 模式",
    descEn: "Get structured JSON responses using the response_format parameter.",
    descZh: "通过 response_format 参数获取结构化 JSON 响应。",
    bulletsEn: ["JSON mode for free-form JSON output", "Structured outputs with JSON Schema validation"],
    bulletsZh: ["JSON 模式：自由格式的 JSON 输出", "结构化输出：基于 JSON Schema 校验"],
    code: structuredOutputCode,
  },
  {
    id: "vision",
    icon: Eye,
    titleEn: "Vision & Multimodal",
    titleZh: "视觉与多模态",
    descEn: "Send images and multimodal content to vision-capable models.",
    descZh: "向支持视觉的模型发送图片和多模态内容。",
    bulletsEn: ["Supports GPT-4o, Claude 3.5 Sonnet, Gemini, and more", "Base64 and URL image inputs"],
    bulletsZh: ["支持 GPT-4o、Claude 3.5 Sonnet、Gemini 等模型", "支持 Base64 和 URL 图片输入"],
    code: visionCode,
  },
  {
    id: "prompt-caching",
    icon: Database,
    titleEn: "Prompt Caching",
    titleZh: "提示词缓存",
    descEn: "OortAPI supports prompt caching for eligible models, reducing costs by up to 90%.",
    descZh: "OortAPI 支持符合条件的模型的提示词缓存，最高可节省 90% 成本。",
    bulletsEn: ["Automatic caching for Anthropic models via cache_control", "OpenAI caching is automatic — no code changes needed", "Significant cost savings on repeated prompts"],
    bulletsZh: ["Anthropic 模型通过 cache_control 自动缓存", "OpenAI 缓存自动生效，无需修改代码", "重复提示词可大幅节省成本"],
    code: promptCachingCode,
  },
  {
    id: "model-routing",
    icon: GitBranch,
    titleEn: "Model Routing",
    titleZh: "模型路由",
    descEn: "Intelligent routing across multiple upstream channels for reliability.",
    descZh: "智能路由多个上游通道，确保高可用性。",
    bulletsEn: ["Weight-based routing across channels", "Automatic failover on upstream errors", "Continuous health monitoring"],
    bulletsZh: ["基于权重的多通道路由", "上游故障时自动切换", "持续健康监控"],
    code: `# Model routing is handled transparently by OortAPI.
# Simply send your request with the model name —
# the relay selects the best available channel automatically.

curl https://api.oortapi.com/v1/chat/completions \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{ "role": "user", "content": "Hello!" }]
  }'

# If the primary channel is unavailable, the request
# is automatically retried on a fallback channel.`,
  },
];

export function FeaturesContent() {
  const { lang } = useI18n();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          {lang === "zh" ? "功能总览" : "Features Overview"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "zh"
            ? "OortAPI 中继平台提供的核心能力一览。每个功能对上游 API 完全透明，无需修改现有代码。"
            : "A quick look at the core capabilities of the OortAPI relay. Every feature is transparent to the upstream API — no code changes required."}
        </p>
      </div>

      {/* Feature cards */}
      {sections.map((s) => {
        const Icon = s.icon;
        const title = lang === "zh" ? s.titleZh : s.titleEn;
        const desc = lang === "zh" ? s.descZh : s.descEn;
        const bullets = lang === "zh" ? s.bulletsZh : s.bulletsEn;

        return (
          <section key={s.id} id={s.id} className="rounded-xl border border-border/50 overflow-hidden glass-card">
            <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              <ul className="space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <CodeBlock code={s.code} language={s.codeLang || "bash"} />
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <div className="rounded-xl border border-border/50 glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold mb-1">
            {lang === "zh" ? "准备好了吗？" : "Ready to get started?"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {lang === "zh"
              ? "几分钟内即可完成接入，开始使用 OortAPI 的全部功能。"
              : "Get up and running in minutes and unlock all OortAPI features."}
          </p>
        </div>
        <Link href="/docs/quickstart" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-4">
          {lang === "zh" ? "快速开始" : "Quickstart"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Cross Links */}
      <CrossLinks links={[
        { title: lang === "zh" ? "流式输出" : "Streaming", href: "/docs/streaming", description: lang === "zh" ? "实时流式获取模型响应" : "Real-time streaming responses" },
        { title: lang === "zh" ? "API 端点" : "Endpoints", href: "/docs/endpoints", description: lang === "zh" ? "查看所有可用的 API 端点" : "View all available API endpoints" },
        { title: lang === "zh" ? "SDK 集成" : "SDK Integration", href: "/docs/sdk", description: lang === "zh" ? "使用 Python/Node.js SDK 接入" : "Use Python/Node.js SDKs" },
      ]} />
    </div>
  );
}
