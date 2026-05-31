"use client";

import { useI18n } from "@/contexts/i18n-context";
import { EndpointRow } from "@/components/docs/endpoint-row";
import { CodeBlock } from "@/components/docs/code-block";
import { CreditCard, Users, Cpu, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function SchemaSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-border/20">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {title}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function ParamTable({ params }: { params: { name: string; type: string; required: boolean; desc: string; default?: string }[] }) {
  return (
    <div className="rounded-lg border border-border/30 overflow-hidden text-xs mb-3">
      <div className="grid grid-cols-[1fr_5rem_4rem_5rem_1fr] gap-2 px-3 py-2 bg-muted/10 font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20">
        <span>Name</span><span>Type</span><span>Req.</span><span>Default</span><span>Description</span>
      </div>
      {params.map((p) => (
        <div key={p.name} className="grid grid-cols-[1fr_5rem_4rem_5rem_1fr] gap-2 px-3 py-2 border-b border-border/10 last:border-b-0">
          <code className="font-mono text-emerald-500">{p.name}</code>
          <span className="text-sky-400 font-mono">{p.type}</span>
          <span>{p.required ? <span className="text-amber-400">Yes</span> : <span className="text-muted-foreground">No</span>}</span>
          <span className="text-muted-foreground font-mono">{p.default ?? "—"}</span>
          <span className="text-muted-foreground">{p.desc}</span>
        </div>
      ))}
    </div>
  );
}

export default function EndpointsPage() {
  const { t, lang } = useI18n();
  const L = t.apiDocs;

  const sectionHeader =
    "flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-t-xl border-b";

  const curlChat = `curl -X POST https://your-domain.com/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "max_tokens": 1024,
    "stream": false
  }'`;

  const curlModels = `curl https://your-domain.com/api/v1/models \\
  -H "Authorization: Bearer sk-oort-your-key"`;

  const curlMessages = `curl -X POST https://your-domain.com/api/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk-oort-your-key" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`;

  const curlEmbeddings = `curl -X POST https://your-domain.com/api/v1/embeddings \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "text-embedding-3-small",
    "input": "Hello world"
  }'`;

  const curlImages = `curl -X POST https://your-domain.com/api/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oort-your-key" \\
  -d '{
    "model": "dall-e-3",
    "prompt": "A sunset over mountains",
    "n": 1,
    "size": "1024x1024"
  }'`;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.endpointsTitle}</h1>
        <p className="text-muted-foreground">{L.endpointsDesc}</p>
      </div>

      {/* ========== Chat Completions ========== */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-sky-500/5 text-sky-400 border-sky-500/10`}>
          <Cpu className="h-4 w-4" />
          {L.chatCompletion}
        </div>
        <EndpointRow method="POST" path="/api/v1/chat/completions" description={L.chatCompletion} />
        <SchemaSection title={lang === "zh" ? "请求参数" : "Request Parameters"}>
          <ParamTable params={[
            { name: "model", type: "string", required: true, desc: lang === "zh" ? "模型 ID，如 gpt-4o" : "Model ID, e.g. gpt-4o" },
            { name: "messages", type: "array", required: true, desc: lang === "zh" ? "消息数组，包含 role 和 content" : "Array of message objects with role and content" },
            { name: "temperature", type: "number", required: false, default: "1", desc: lang === "zh" ? "采样温度 0-2" : "Sampling temperature 0-2" },
            { name: "max_tokens", type: "integer", required: false, desc: lang === "zh" ? "最大输出 token 数" : "Maximum tokens to generate" },
            { name: "stream", type: "boolean", required: false, default: "false", desc: lang === "zh" ? "是否启用流式输出" : "Enable streaming" },
            { name: "tools", type: "array", required: false, desc: lang === "zh" ? "工具/函数定义数组" : "Array of tool/function definitions" },
            { name: "response_format", type: "object", required: false, desc: lang === "zh" ? '输出格式，如 {"type":"json_object"}' : 'Output format, e.g. {"type":"json_object"}' },
          ]} />
          <CodeBlock code={curlChat} />
        </SchemaSection>
        <SchemaSection title={lang === "zh" ? "响应示例" : "Response Example"}>
          <CodeBlock code={`{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 9,
    "total_tokens": 34
  }
}`} />
        </SchemaSection>
      </div>

      {/* ========== Messages (Anthropic) ========== */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-amber-500/5 text-amber-400 border-amber-500/10`}>
          <Cpu className="h-4 w-4" />
          {L.messageCompletion}
        </div>
        <EndpointRow method="POST" path="/api/v1/messages" description={L.messageCompletion} />
        <SchemaSection title={lang === "zh" ? "请求参数" : "Request Parameters"}>
          <ParamTable params={[
            { name: "model", type: "string", required: true, desc: lang === "zh" ? "模型 ID，如 claude-sonnet-4-20250514" : "Model ID, e.g. claude-sonnet-4-20250514" },
            { name: "messages", type: "array", required: true, desc: lang === "zh" ? "消息数组" : "Array of message objects" },
            { name: "max_tokens", type: "integer", required: true, desc: lang === "zh" ? "最大输出 token 数（必填）" : "Maximum tokens to generate (required)" },
            { name: "system", type: "string", required: false, desc: lang === "zh" ? "系统提示词" : "System prompt" },
            { name: "temperature", type: "number", required: false, default: "1.0", desc: lang === "zh" ? "采样温度 0-1" : "Sampling temperature 0-1" },
            { name: "stream", type: "boolean", required: false, default: "false", desc: lang === "zh" ? "是否启用流式输出" : "Enable streaming" },
          ]} />
          <CodeBlock code={curlMessages} />
        </SchemaSection>
        <SchemaSection title={lang === "zh" ? "响应示例" : "Response Example"}>
          <CodeBlock code={`{
  "id": "msg_xxx",
  "type": "message",
  "model": "claude-sonnet-4-20250514",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help you today?"
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 25,
    "output_tokens": 9
  }
}`} />
        </SchemaSection>
      </div>

      {/* ========== Other AI Endpoints ========== */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-violet-500/5 text-violet-400 border-violet-500/10`}>
          <Cpu className="h-4 w-4" />
          {lang === "zh" ? "其他 AI 端点" : "Other AI Endpoints"}
        </div>
        <EndpointRow method="POST" path="/api/v1/embeddings" description={L.embeddings} />
        <SchemaSection title={lang === "zh" ? "请求与响应" : "Request & Response"}>
          <ParamTable params={[
            { name: "model", type: "string", required: true, desc: lang === "zh" ? "嵌入模型，如 text-embedding-3-small" : "Embedding model, e.g. text-embedding-3-small" },
            { name: "input", type: "string|array", required: true, desc: lang === "zh" ? "要嵌入的文本" : "Text to embed" },
          ]} />
          <CodeBlock code={curlEmbeddings} />
        </SchemaSection>
        <SchemaSection title={lang === "zh" ? "响应示例" : "Response Example"}>
          <CodeBlock code={`{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.0023, -0.0091, 0.0157, ...],
      "index": 0
    }
  ],
  "model": "text-embedding-3-small",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}`} />
        </SchemaSection>

        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/v1/images/generations" description={L.imageGen} />
        <SchemaSection title={lang === "zh" ? "请求与响应" : "Request & Response"}>
          <ParamTable params={[
            { name: "model", type: "string", required: true, desc: lang === "zh" ? "图像模型，如 dall-e-3" : "Image model, e.g. dall-e-3" },
            { name: "prompt", type: "string", required: true, desc: lang === "zh" ? "图像描述" : "Image description" },
            { name: "n", type: "integer", required: false, default: "1", desc: lang === "zh" ? "生成数量" : "Number of images" },
            { name: "size", type: "string", required: false, default: "1024x1024", desc: lang === "zh" ? "尺寸，如 1024x1024" : "Size, e.g. 1024x1024" },
          ]} />
          <CodeBlock code={curlImages} />
        </SchemaSection>
        <SchemaSection title={lang === "zh" ? "响应示例" : "Response Example"}>
          <CodeBlock code={`{
  "created": 1700000000,
  "data": [
    {
      "url": "https://...",
      "revised_prompt": "..."
    }
  ]
}`} />
        </SchemaSection>

        <div className="border-t border-border/20" />
        <EndpointRow method="GET" path="/api/v1/models" description={L.modelList} />
        <SchemaSection title={lang === "zh" ? "示例" : "Example"}>
          <CodeBlock code={curlModels} />
        </SchemaSection>
        <SchemaSection title={lang === "zh" ? "响应示例" : "Response Example"}>
          <CodeBlock code={`{
  "object": "list",
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      "created": 1700000000,
      "owned_by": "openai"
    }
  ]
}`} />
        </SchemaSection>
      </div>

      {/* ========== Billing Endpoints ========== */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-emerald-500/5 text-emerald-400 border-emerald-500/10`}>
          <CreditCard className="h-4 w-4" />
          {L.billingEndpoints}
        </div>
        <EndpointRow method="GET" path="/api/v1/billing/balance" description={L.balance} />
        <EndpointRow method="GET" path="/api/v1/billing/usage" description={L.usage} />
        <EndpointRow method="POST" path="/api/v1/billing/redeem" description={L.redeem} />
        <SchemaSection title={lang === "zh" ? "余额响应示例" : "Balance Response Example"}>
          <CodeBlock code={`{
  "balance": 128.50,
  "currency": "CNY"
}`} />
        </SchemaSection>
        <SchemaSection title={lang === "zh" ? "兑换请求与响应" : "Redeem Request & Response"}>
          <ParamTable params={[
            { name: "code", type: "string", required: true, desc: lang === "zh" ? "兑换码" : "Redeem code" },
          ]} />
          <CodeBlock code={`{
  "balance": 178.50,
  "added": 50.00
}`} />
        </SchemaSection>
      </div>

      {/* ========== User Endpoints ========== */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-purple-500/5 text-purple-400 border-purple-500/10`}>
          <Users className="h-4 w-4" />
          {L.userEndpoints}
        </div>
        <EndpointRow method="POST" path="/api/auth/login" description="Login" />
        <SchemaSection title={lang === "zh" ? "请求与响应" : "Request & Response"}>
          <ParamTable params={[
            { name: "email", type: "string", required: true, desc: lang === "zh" ? "注册邮箱" : "Registered email" },
            { name: "password", type: "string", required: true, desc: lang === "zh" ? "账户密码" : "Account password" },
          ]} />
          <CodeBlock code={`{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "username": "demo",
    "role": "user"
  }
}`} />
        </SchemaSection>

        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/auth/register" description="Register" />
        <SchemaSection title={lang === "zh" ? "请求与响应" : "Request & Response"}>
          <ParamTable params={[
            { name: "email", type: "string", required: true, desc: lang === "zh" ? "注册邮箱" : "Email address" },
            { name: "password", type: "string", required: true, desc: lang === "zh" ? "账户密码" : "Account password" },
            { name: "username", type: "string", required: true, desc: lang === "zh" ? "用户名" : "Username" },
          ]} />
          <CodeBlock code={`{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "username": "demo",
    "role": "user"
  }
}`} />
        </SchemaSection>

        <div className="border-t border-border/20" />
        <EndpointRow method="GET" path="/api/auth/me" description="Get Current User" />
        <SchemaSection title={lang === "zh" ? "响应示例" : "Response Example"}>
          <CodeBlock code={`{
  "id": "usr_xxx",
  "email": "user@example.com",
  "username": "demo",
  "role": "user"
}`} />
        </SchemaSection>

        <div className="border-t border-border/20" />
        <EndpointRow method="PATCH" path="/api/auth/profile" description="Update Profile" />
        <SchemaSection title={lang === "zh" ? "请求与响应" : "Request & Response"}>
          <ParamTable params={[
            { name: "username", type: "string", required: false, desc: lang === "zh" ? "新用户名" : "New username" },
            { name: "bio", type: "string", required: false, desc: lang === "zh" ? "个人简介" : "Bio / about" },
          ]} />
          <CodeBlock code={`{
  "user": {
    "id": "usr_xxx",
    "email": "user@example.com",
    "username": "new_name",
    "bio": "Hello world"
  }
}`} />
        </SchemaSection>

        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/auth/change-password" description="Change Password" />
        <SchemaSection title={lang === "zh" ? "请求与响应" : "Request & Response"}>
          <ParamTable params={[
            { name: "currentPassword", type: "string", required: true, desc: lang === "zh" ? "当前密码" : "Current password" },
            { name: "newPassword", type: "string", required: true, desc: lang === "zh" ? "新密码" : "New password" },
          ]} />
          <CodeBlock code={`{
  "success": true
}`} />
        </SchemaSection>
      </div>

      {/* ========== Pagination ========== */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-slate-500/5 text-slate-400 border-slate-500/10`}>
          <Cpu className="h-4 w-4" />
          {lang === "zh" ? "分页" : "Pagination"}
        </div>
        <div className="px-5 py-4 space-y-4 text-sm text-muted-foreground">
          <p>
            {lang === "zh"
              ? "列表端点（如 GET /api/v1/models、GET /api/v1/billing/usage）支持分页查询，使用以下查询参数："
              : "List endpoints (e.g. GET /api/v1/models, GET /api/v1/billing/usage) support pagination via the following query parameters:"}
          </p>
          <ParamTable params={[
            { name: "page", type: "integer", required: false, default: "1", desc: lang === "zh" ? "页码，从 1 开始" : "Page number, starts at 1" },
            { name: "per_page", type: "integer", required: false, default: "20", desc: lang === "zh" ? "每页条数，最大 100" : "Items per page, max 100" },
          ]} />
          <p className="text-xs">
            {lang === "zh"
              ? "示例：GET /api/v1/models?page=2&per_page=10"
              : "Example: GET /api/v1/models?page=2&per_page=10"}
          </p>
          <SchemaSection title={lang === "zh" ? "分页响应示例" : "Paginated Response Example"}>
            <CodeBlock code={`{
  "total": 56,
  "page": 2,
  "per_page": 10,
  "data": [
    { "id": "gpt-4o", "object": "model", "created": 1700000000, "owned_by": "openai" },
    ...
  ]
}`} />
          </SchemaSection>
        </div>
      </div>
    </div>
  );
}
