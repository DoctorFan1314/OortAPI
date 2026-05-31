"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { Code2, FlaskConical, Zap, AlertTriangle } from "lucide-react";

export default function SdkPage() {
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const OAI_BASE = origin ? `${origin}/api/v1` : "https://your-domain.com/api/v1";
  const ANTH_BASE = origin ? `${origin}/api` : "https://your-domain.com/api";
  const { t, lang } = useI18n();
  const L = t.apiDocs;

  const openaiPython = `import openai

client = openai.OpenAI(
    api_key="sk-oortapi-your-key",
    base_url="${OAI_BASE}"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.choices[0].message.content)`;

  const openaiNodejs = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-oortapi-your-key",
  baseURL: "${OAI_BASE}",
});

const response = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.choices[0].message.content);`;

  const anthropicPython = `import anthropic

client = anthropic.Anthropic(
    api_key="sk-oortapi-your-key",
    base_url="${ANTH_BASE}"
)

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)
print(response.content[0].text)`;

  const anthropicNodejs = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "sk-oortapi-your-key",
  baseURL: "${ANTH_BASE}",
});

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});
console.log(response.content[0].text);`;

  const curlChat = `curl ${OAI_BASE}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oortapi-your-key" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  const curlAnthropic = `curl ${ANTH_BASE}/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk-oortapi-your-key" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  const curlStream = `curl ${OAI_BASE}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-oortapi-your-key" \\
  -d '{
    "model": "gpt-4o",
    "stream": true,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`;

  const curlBalance = `curl ${OAI_BASE}/billing/balance \\
  -H "Authorization: Bearer sk-oortapi-your-key"`;

  const langchainExample = `from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o",
    openai_api_key="sk-oortapi-your-key",
    openai_api_base="${OAI_BASE}"
)

response = llm.invoke("Hello!")
print(response.content)`;

  const vercelAiExample = `import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const { text } = await generateText({
  model: openai("gpt-4o", {
    baseURL: "${OAI_BASE}",
    apiKey: "sk-oortapi-your-key",
  }),
  prompt: "Hello!",
});
console.log(text);`;

  const streamingPython = `import openai

client = openai.OpenAI(
    api_key="sk-oortapi-your-key",
    base_url="${OAI_BASE}"
)

stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a haiku"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)`;

  const errorHandlingPython = `import openai

client = openai.OpenAI(
    api_key="sk-oortapi-your-key",
    base_url="${OAI_BASE}"
)

try:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print(response.choices[0].message.content)
except openai.AuthenticationError:
    print("Invalid API key")
except openai.RateLimitError:
    print("Rate limit exceeded — retry with backoff")
except openai.APIError as e:
    print(f"API error: {e.status_code}")`;

  const frameworkRow = "flex items-center gap-3 px-5 py-3 border-b border-border/20 last:border-b-0";

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.navSdk}</h1>
        <p className="text-muted-foreground">{L.sdkDesc}</p>
      </div>

      <BaseUrlDisplay />

      {/* Quick Start: OpenAI SDK Drop-in */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          {lang === "zh" ? "最快接入：OpenAI SDK 直接替换" : "Fastest Integration: OpenAI SDK Drop-in"}
        </h2>
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-muted-foreground">
          <p>
            {lang === "zh"
              ? "只需修改 base_url，无需更改任何其他代码。OortAPI 完全兼容 OpenAI SDK 的所有功能。"
              : "Just change the base_url — no other code changes needed. OortAPI is fully compatible with all OpenAI SDK features."}
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.python}</h3>
            <CodeBlock code={openaiPython} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.nodejs}</h3>
            <CodeBlock code={openaiNodejs} />
          </div>
        </div>
      </section>

      {/* Anthropic SDK */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-amber-400" />
          Anthropic SDK
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.python}</h3>
            <CodeBlock code={anthropicPython} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.nodejs}</h3>
            <CodeBlock code={anthropicNodejs} />
          </div>
        </div>
      </section>

      {/* Framework Integration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-violet-400" />
          {lang === "zh" ? "框架集成" : "Framework Integration"}
        </h2>

        {/* LangChain */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="bg-muted/10 px-5 py-3 border-b border-border/20">
            <h3 className="text-sm font-semibold">LangChain</h3>
          </div>
          <div className="p-5">
            <CodeBlock code={langchainExample} language="python" />
          </div>
        </div>

        {/* Vercel AI SDK */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="bg-muted/10 px-5 py-3 border-b border-border/20">
            <h3 className="text-sm font-semibold">Vercel AI SDK</h3>
          </div>
          <div className="p-5">
            <CodeBlock code={vercelAiExample} language="typescript" />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-muted/10">
            <span>{lang === "zh" ? "框架" : "Framework"}</span>
            <span>Base URL</span>
            <span>{lang === "zh" ? "SDK" : "SDK"}</span>
          </div>
          <div className={frameworkRow}>
            <span className="text-sm font-medium">LangChain</span>
            <code className="text-xs font-mono text-muted-foreground">{OAI_BASE}</code>
            <span className="text-xs text-muted-foreground">OpenAI Chat Model</span>
          </div>
          <div className={frameworkRow}>
            <span className="text-sm font-medium">Vercel AI SDK</span>
            <code className="text-xs font-mono text-muted-foreground">{OAI_BASE}</code>
            <span className="text-xs text-muted-foreground">openai provider</span>
          </div>
          <div className={frameworkRow}>
            <span className="text-sm font-medium">LlamaIndex</span>
            <code className="text-xs font-mono text-muted-foreground">{OAI_BASE}</code>
            <span className="text-xs text-muted-foreground">OpenAI LLM</span>
          </div>
        </div>
      </section>

      {/* Streaming Example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-sky-400" />
          {lang === "zh" ? "流式输出示例" : "Streaming Example"}
        </h2>
        <CodeBlock code={streamingPython} language="python" />
      </section>

      {/* Error Handling */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          {lang === "zh" ? "错误处理" : "Error Handling"}
        </h2>
        <CodeBlock code={errorHandlingPython} language="python" />
      </section>

      {/* cURL Examples */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          {lang === "zh" ? "cURL 示例" : "cURL Examples"}
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.chatCompletions}</h3>
            <CodeBlock code={curlChat} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.messageCompletion}</h3>
            <CodeBlock code={curlAnthropic} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.streamTitle}</h3>
            <CodeBlock code={curlStream} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.checkBalance}</h3>
            <CodeBlock code={curlBalance} />
          </div>
        </div>
      </section>
    </div>
  );
}
