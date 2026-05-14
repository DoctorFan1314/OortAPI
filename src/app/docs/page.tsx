"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Code, Zap, Shield, BookOpen, Terminal, CreditCard, Cpu, ArrowRight, Globe, Key, AppWindow, Copy, Check } from "lucide-react";

const methodBadge: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POST: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  PATCH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${methodBadge[method] || "bg-muted text-muted-foreground"}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div className="relative group">
      <pre className="bg-zinc-950 rounded-lg p-4 overflow-x-auto text-sm leading-relaxed border border-zinc-800">
        <code className="text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
      </button>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={handleCopy} className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors" title={copied ? "Copied" : "Copy"}>
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
    </button>
  );
}

function BaseUrlDisplay({ origin }: { origin: string }) {
  const openaiUrl = `${origin}/api/v1`;
  const anthropicUrl = `${origin}/api`;

  return (
    <div className="grid sm:grid-cols-2 gap-4 mb-4">
      <div className="rounded-lg border border-border/50 p-4">
        <div className="text-xs font-medium text-emerald-400 mb-2">OpenAI 兼容协议</div>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-foreground break-all flex-1 select-all">{openaiUrl}</code>
          <CopyButton text={openaiUrl} />
        </div>
      </div>
      <div className="rounded-lg border border-border/50 p-4">
        <div className="text-xs font-medium text-amber-400 mb-2">Anthropic 兼容协议</div>
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-foreground break-all flex-1 select-all">{anthropicUrl}</code>
          <CopyButton text={anthropicUrl} />
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const oai = origin ? `${origin}/api/v1` : "https://your-domain.com/api/v1";
  const ant = origin ? `${origin}/api` : "https://your-domain.com/api";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="border-b border-border bg-gradient-to-b from-background via-background to-muted/20">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Zap className="h-3 w-3" />
            OpenAI + Anthropic 双协议兼容 · 一个 Key 聚合所有 AI 服务
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">OortAPI 文档</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            一个 API Key 访问 OpenAI、Anthropic、Google、DeepSeek 等 30+ AI 服务。
            同时兼容 OpenAI 和 Anthropic SDK，无需修改代码即可切换。
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <Code className="h-4 w-4" />
              API 在线调试
            </Link>
            <Link
              href="/models"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium"
            >
              <Cpu className="h-4 w-4" />
              查看模型市场
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-12 space-y-16">

        {/* ===== Quick Start ===== */}
        <section id="quickstart">
          <h2 className="text-2xl font-bold mb-2">快速开始</h2>
          <p className="text-muted-foreground mb-8">3 步接入 OortAPI，2 分钟内完成。</p>

          <div className="space-y-10">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">1</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  获取 API Key
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  注册并登录后，进入 <Link href="/dashboard/keys" className="text-primary hover:underline font-medium">控制台 → API Keys</Link>，点击创建。你的 Key 以 <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">sk-oort-</code> 开头。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">2</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  配置 Base URL
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  根据你的客户端选择对应协议的 Base URL，点击右侧按钮复制即可：
                </p>

                {origin ? (
                  <BaseUrlDisplay origin={origin} />
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-lg border border-border/50 p-4">
                      <div className="text-xs font-medium text-emerald-400 mb-2">OpenAI 兼容协议</div>
                      <code className="text-sm font-mono text-foreground break-all">{oai}</code>
                    </div>
                    <div className="rounded-lg border border-border/50 p-4">
                      <div className="text-xs font-medium text-amber-400 mb-2">Anthropic 兼容协议</div>
                      <code className="text-sm font-mono text-foreground break-all">{ant}</code>
                    </div>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">提示：</strong>大多数 AI 客户端（ChatBox、Cherry Studio 等）使用 <strong>OpenAI 兼容协议</strong>。</p>
                  <p><strong className="text-foreground">Anthropic 协议</strong>适用于直接调用 Claude 原生接口的场景，如使用 Anthropic Python/Node SDK 或 <code className="text-xs bg-muted px-1 rounded font-mono">claude-code</code> 等工具。</p>
                  <p>两个协议使用<strong>同一个 API Key</strong>，支持所有已配置的模型。</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">3</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <AppWindow className="h-4 w-4 text-primary" />
                  开始使用
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  选择你熟悉的 AI 应用或开发方式，填入 API Key 和 Base URL 即可。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AI Application Integration ===== */}
        <section id="apps">
          <h2 className="text-2xl font-bold mb-2">在 AI 应用中使用</h2>
          <p className="text-muted-foreground mb-6">以下客户端均已支持 OpenAI 兼容接口，填入 Base URL 和 API Key 即可使用。</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "ChatBox", desc: "跨平台 AI 桌面客户端，支持 iOS/Android/Mac/Windows/Web", config: "设置 → 模型提供方 → OpenAI API\nAPI 域名: 你的 Base URL\nAPI Key: 你的 Key" },
              { name: "Cherry Studio", desc: "功能丰富的 AI 桌面客户端，支持多模型切换", config: "设置 → 模型服务商 → 添加\nAPI 地址: 你的 Base URL\nAPI Key: 你的 Key" },
              { name: "Open WebUI", desc: "自托管 Web 界面，兼容 OpenAI API", config: "Settings → Connections\nOpenAI API: 你的 Base URL\nAPI Key: 你的 Key" },
              { name: "NextChat", desc: "流行的 Web AI 聊天界面", config: "设置 → OpenAI API 代理地址\n填入: 你的 Base URL\nAPI Key: 你的 Key" },
              { name: "LobeChat", desc: "现代化的 AI 聊天框架", config: "设置 → 语言模型 → OpenAI\nAPI 代理地址: 你的 Base URL\nAPI Key: 你的 Key" },
              { name: "Claude Code", desc: "Anthropic 官方 CLI 工具，使用 Anthropic 协议", config: "export ANTHROPIC_BASE_URL=你的 Anthropic Base URL\nexport ANTHROPIC_API_KEY=你的 Key\nclaude" },
            ].map((app) => (
              <div key={app.name} className="rounded-xl border border-border/50 p-5 hover:border-foreground/20 transition-colors">
                <h3 className="font-semibold text-sm mb-1">{app.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{app.desc}</p>
                <pre className="text-[11px] text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">{app.config}</pre>
              </div>
            ))}
          </div>
        </section>

        {/* ===== SDK Integration ===== */}
        <section id="sdk">
          <h2 className="text-2xl font-bold mb-6">SDK 集成</h2>

          {/* OpenAI SDK */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OpenAI</span>
              使用 OpenAI SDK
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Python</div>
                <CodeBlock code={`from openai import OpenAI

client = OpenAI(
    api_key="sk-oort-YOUR_API_KEY",
    base_url="${oai}"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)`} />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Node.js</div>
                <CodeBlock code={`import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-oort-YOUR_API_KEY",
  baseURL: "${oai}",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content)`} />
              </div>
            </div>

            <div className="rounded-xl border border-border/50 divide-y divide-border/30">
              {[
                { name: "LangChain", change: `openai_api_base="${oai}"` },
                { name: "Vercel AI SDK", change: `baseURL: "${oai}"` },
                { name: "LlamaIndex", change: `api_base="${oai}"` },
              ].map((sdk) => (
                <div key={sdk.name} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3">
                  <div className="font-medium text-sm w-40 shrink-0">{sdk.name}</div>
                  <code className="text-xs text-muted-foreground font-mono">{sdk.change}</code>
                </div>
              ))}
            </div>
          </div>

          {/* Anthropic SDK */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Anthropic</span>
              使用 Anthropic SDK
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Python</div>
                <CodeBlock code={`import anthropic

client = anthropic.Anthropic(
    api_key="sk-oort-YOUR_API_KEY",
    base_url="${ant}"
)

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
)
print(message.content[0].text)`} />
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Node.js</div>
                <CodeBlock code={`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "sk-oort-YOUR_API_KEY",
  baseURL: "${ant}",
});

const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(message.content[0].text)`} />
              </div>
            </div>
          </div>
        </section>

        {/* ===== cURL Examples ===== */}
        <section id="curl">
          <h2 className="text-2xl font-bold mb-6">cURL 示例</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OpenAI</span>
                聊天补全
              </h3>
              <CodeBlock code={`curl ${oai}/chat/completions \\
  -H "Authorization: Bearer sk-oort-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`} />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Anthropic</span>
                聊天补全
              </h3>
              <CodeBlock code={`curl ${ant}/v1/messages \\
  -H "x-api-key: sk-oort-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`} />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">流式响应（OpenAI 格式）</h3>
              <CodeBlock code={`curl ${oai}/chat/completions \\
  -H "Authorization: Bearer sk-oort-YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'

# 响应格式：
# data: {"id":"...","choices":[{"delta":{"content":"Hello"}}]}
# data: {"id":"...","choices":[{"delta":{"content":"!"}}]}
# data: [DONE]`} />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">查询余额与模型</h3>
              <CodeBlock code={`# 查询余额
curl ${oai}/billing/balance \\
  -H "Authorization: Bearer sk-oort-YOUR_API_KEY"

# 获取模型列表
curl ${oai}/models \\
  -H "Authorization: Bearer sk-oort-YOUR_API_KEY"`} />
            </div>
          </div>
        </section>

        {/* ===== Streaming ===== */}
        <section id="streaming">
          <h2 className="text-2xl font-bold mb-6">流式响应</h2>
          <p className="text-muted-foreground mb-6">OortAPI 同时支持 OpenAI 和 Anthropic 两种 SSE 流式格式，客户端会收到对应协议的标准流。</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-sm space-y-2">
              <p className="font-semibold text-emerald-400 mb-2">OpenAI 格式</p>
              <p>• 每个 chunk 以 <code className="text-xs bg-muted px-1 rounded font-mono">data: </code> 前缀</p>
              <p>• 流结束以 <code className="text-xs bg-muted px-1 rounded font-mono">data: [DONE]</code> 标记</p>
              <p>• usage 通过 <code className="text-xs bg-muted px-1 rounded font-mono">stream_options.include_usage</code> 注入</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 text-sm space-y-2">
              <p className="font-semibold text-amber-400 mb-2">Anthropic 格式</p>
              <p>• 使用 <code className="text-xs bg-muted px-1 rounded font-mono">event:</code> 前缀标识事件类型</p>
              <p>• 事件包括 <code className="text-xs bg-muted px-1 rounded font-mono">message_start</code>, <code className="text-xs bg-muted px-1 rounded font-mono">content_block_delta</code>, <code className="text-xs bg-muted px-1 rounded font-mono">message_stop</code> 等</p>
              <p>• 通过 <code className="text-xs bg-muted px-1 rounded font-mono">x-api-key</code> 头认证</p>
            </div>
          </div>
        </section>

        {/* ===== API Endpoints ===== */}
        <section id="endpoints">
          <h2 className="text-2xl font-bold mb-2">API 端点一览</h2>
          <p className="text-muted-foreground mb-6">OortAPI 同时提供 OpenAI 和 Anthropic 兼容的 API 端点。</p>

          <div className="space-y-6">
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-5 py-3.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">AI 模型接口 — OpenAI 兼容（<code className="font-mono text-xs">/api/v1</code>）</h3>
              </div>
              <div className="divide-y divide-border/20">
                {[
                  { method: "POST", path: "/api/v1/chat/completions", desc: "聊天补全（支持流式）" },
                  { method: "POST", path: "/api/v1/completions", desc: "文本补全" },
                  { method: "POST", path: "/api/v1/embeddings", desc: "文本嵌入" },
                  { method: "POST", path: "/api/v1/images/generations", desc: "图像生成" },
                  { method: "GET", path: "/api/v1/models", desc: "获取可用模型列表" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                    <MethodBadge method={ep.method} />
                    <code className="text-sm font-mono flex-1">{ep.path}</code>
                    <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-5 py-3.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-sm">AI 模型接口 — Anthropic 兼容（<code className="font-mono text-xs">/api</code>）</h3>
              </div>
              <div className="divide-y divide-border/20">
                {[
                  { method: "POST", path: "/api/v1/messages", desc: "消息补全（支持流式，Anthropic 格式）" },
                  { method: "GET", path: "/api/v1/models", desc: "获取可用模型列表" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                    <MethodBadge method={ep.method} />
                    <code className="text-sm font-mono flex-1">{ep.path}</code>
                    <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-5 py-3.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">计费接口</h3>
              </div>
              <div className="divide-y divide-border/20">
                {[
                  { method: "GET", path: "/api/v1/billing/balance", desc: "查询账户余额" },
                  { method: "GET", path: "/api/v1/billing/usage", desc: "查询用量记录" },
                  { method: "POST", path: "/api/v1/billing/redeem", desc: "兑换充值码" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                    <MethodBadge method={ep.method} />
                    <code className="text-sm font-mono flex-1">{ep.path}</code>
                    <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-5 py-3.5 bg-muted/30 border-b border-border/50 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">用户接口</h3>
              </div>
              <div className="divide-y divide-border/20">
                {[
                  { method: "POST", path: "/api/auth/login", desc: "用户登录" },
                  { method: "POST", path: "/api/auth/register", desc: "用户注册" },
                  { method: "GET", path: "/api/auth/me", desc: "获取当前用户信息" },
                  { method: "PATCH", path: "/api/auth/profile", desc: "更新个人资料" },
                  { method: "POST", path: "/api/auth/change-password", desc: "修改密码" },
                ].map((ep) => (
                  <div key={ep.path} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                    <MethodBadge method={ep.method} />
                    <code className="text-sm font-mono flex-1">{ep.path}</code>
                    <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ===== Pricing ===== */}
        <section id="pricing">
          <h2 className="text-2xl font-bold mb-2">计费说明</h2>
          <p className="text-muted-foreground mb-6">OortAPI 采用三级缓存感知定价，按实际 Token 用量计费。支持倍率系统（常规倍率 + 时段倍率）。</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "输入 Token", desc: "普通输入请求", color: "text-blue-400" },
              { label: "补全 Token", desc: "模型生成输出", color: "text-green-400" },
              { label: "缓存读取", desc: "命中缓存的输入（更便宜）", color: "text-emerald-400" },
              { label: "缓存创建", desc: "首次写入缓存的输入", color: "text-amber-400" },
            ].map((tier) => (
              <div key={tier.label} className="rounded-lg border border-border/50 p-4">
                <div className={`text-sm font-semibold ${tier.color} mb-1`}>{tier.label}</div>
                <div className="text-xs text-muted-foreground">{tier.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm text-muted-foreground">
            <p>• 每次 API 调用后自动从余额扣除，费率取决于所用模型</p>
            <p>• 缓存 Token 支持 OpenAI（<code className="text-xs bg-muted px-1 rounded font-mono">prompt_tokens_details.cached_tokens</code>）和 Anthropic（<code className="text-xs bg-muted px-1 rounded font-mono">cache_read_input_tokens</code>）两种格式</p>
            <p>• 管理员可在 <Link href="/models" className="text-primary hover:underline">模型市场</Link> 设置每个模型的四档价格</p>
            <p>• 支持倍率系统：常规倍率（按模型）和时段倍率（白天/夜间），详情见 <Link href="/dashboard/multiplier" className="text-primary hover:underline">倍率管理</Link></p>
            <p>• 支持 USD/CNY 双货币显示，汇率由管理员配置</p>
            <p>• 余额不足时 API 返回 402，需通过兑换码或管理员充值</p>
          </div>
        </section>

        {/* ===== Error Codes ===== */}
        <section id="errors">
          <h2 className="text-2xl font-bold mb-2">错误码</h2>
          <p className="text-muted-foreground mb-6">OortAPI 遵循标准 HTTP 状态码。OpenAI 协议返回 OpenAI 格式错误，Anthropic 协议返回 Anthropic 格式错误。</p>

          <div className="rounded-xl border border-border/50 overflow-hidden mb-4">
            <div className="divide-y divide-border/20">
              {[
                { code: "400", desc: "请求参数错误（缺少 model、messages 等）" },
                { code: "401", desc: "认证失败（API Key 无效或缺失）" },
                { code: "402", desc: "余额不足，请充值后重试" },
                { code: "429", desc: "请求频率超限，请稍后重试" },
                { code: "500", desc: "服务器内部错误" },
                { code: "502", desc: "上游服务商返回错误" },
                { code: "503", desc: "无可用渠道（模型未配置或全部离线）" },
              ].map((err) => (
                <div key={err.code} className="flex items-center gap-3 px-5 py-3">
                  <code className="text-sm font-mono font-bold text-red-400 w-10">{err.code}</code>
                  <span className="text-sm text-muted-foreground">{err.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-emerald-400 mb-2">OpenAI 错误格式</div>
              <CodeBlock code={`{
  "error": {
    "message": "Insufficient balance.",
    "type": "gateway_error"
  }
}`} />
            </div>
            <div>
              <div className="text-xs font-medium text-amber-400 mb-2">Anthropic 错误格式</div>
              <CodeBlock code={`{
  "type": "error",
  "error": {
    "type": "authentication_error",
    "message": "Invalid API key"
  }
}`} />
            </div>
          </div>
        </section>

        {/* ===== Auth ===== */}
        <section id="auth">
          <h2 className="text-2xl font-bold mb-2">认证方式</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">OpenAI 格式认证</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">用于所有 OpenAI 兼容接口（<code className="text-xs bg-muted px-1 rounded">/api/v1/*</code>）。</p>
              <CodeBlock code={`Authorization: Bearer sk-oort-YOUR_API_KEY`} />
            </div>
            <div className="rounded-xl border border-border/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-amber-400" />
                <h3 className="font-semibold text-sm">Anthropic 格式认证</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">用于 Anthropic 兼容接口（<code className="text-xs bg-muted px-1 rounded">/api/v1/messages</code>）。支持 <code className="text-xs bg-muted px-1 rounded">x-api-key</code> 和 <code className="text-xs bg-muted px-1 rounded">Authorization: Bearer</code> 两种方式。</p>
              <CodeBlock code={`x-api-key: sk-oort-YOUR_API_KEY`} />
            </div>
          </div>
        </section>

        {/* ===== Resources ===== */}
        <section id="resources">
          <h2 className="text-2xl font-bold mb-2">更多资源</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Cpu, title: "模型市场", desc: "浏览可用模型与定价", href: "/models" },
              { icon: Terminal, title: "在线调试", desc: "Swagger UI 交互式文档", href: "/docs/api-reference" },
              { icon: BookOpen, title: "OpenAPI 规范", desc: "下载 JSON 格式 API 规范", href: "/api/docs/openapi.json" },
            ].map((r) => (
              <Link key={r.title} href={r.href} className="rounded-xl border border-border/50 p-5 hover:border-foreground/20 hover:bg-muted/30 transition-all group">
                <r.icon className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold text-sm mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
                <ArrowRight className="h-3.5 w-3.5 mt-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
