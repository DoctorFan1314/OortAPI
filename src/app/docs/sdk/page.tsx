"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { Code2, FlaskConical } from "lucide-react";

const OAI_BASE = `http://localhost:3000/api/v1`;

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

const ANTH_BASE = `http://localhost:3000/api`;

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

const frameworkRow =
  "flex items-center gap-3 px-5 py-3 border-b border-border/20 last:border-b-0";

export default function SdkPage() {
  const { t } = useI18n();
  const L = t.apiDocs;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.navSdk}</h1>
        <p className="text-muted-foreground">{L.sdkDesc}</p>
      </div>

      {/* Base URL */}
      <BaseUrlDisplay />

      {/* OpenAI SDK */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-sky-400" />
          OpenAI SDK
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.openaiPython}</h3>
            <CodeBlock code={openaiPython} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.openaiNodejs}</h3>
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
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.anthropicPython}</h3>
            <CodeBlock code={anthropicPython} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{L.anthropicNodejs}</h3>
            <CodeBlock code={anthropicNodejs} />
          </div>
        </div>
      </section>

      {/* Framework Integration */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-violet-400" />
          {L.frameworkIntegration}
        </h2>
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <div className="grid grid-cols-3 gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20 bg-muted/10">
            <span>{L.frameworkIntegration}</span>
            <span>Base URL</span>
            <span>{L.sdkSupport}</span>
          </div>
          <div className={frameworkRow}>
            <span className="text-sm font-medium">{L.langchain}</span>
            <code className="text-xs font-mono text-muted-foreground">{OAI_BASE}</code>
            <span className="text-xs text-muted-foreground">OpenAI Chat Model</span>
          </div>
          <div className={frameworkRow}>
            <span className="text-sm font-medium">{L.vercelAiSdk}</span>
            <code className="text-xs font-mono text-muted-foreground">{OAI_BASE}</code>
            <span className="text-xs text-muted-foreground">openai provider</span>
          </div>
          <div className={frameworkRow}>
            <span className="text-sm font-medium">{L.llamaindex}</span>
            <code className="text-xs font-mono text-muted-foreground">{OAI_BASE}</code>
            <span className="text-xs text-muted-foreground">OpenAI LLM</span>
          </div>
        </div>
      </section>

      {/* cURL Examples */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          {L.curlExamples}
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
