"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { BaseUrlDisplay } from "@/components/docs/base-url-display";
import { CrossLinks } from "@/components/docs/cross-links";
import { Code2, FlaskConical, Zap, AlertTriangle, Terminal } from "lucide-react";

export function SdkContent() {
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

  const goExample = `package main

import (
\t"bytes"
\t"encoding/json"
\t"fmt"
\t"io"
\t"net/http"
)

func main() {
\tbody, _ := json.Marshal(map[string]interface{}{
\t\t"model": "gpt-4o",
\t\t"messages": []map[string]string{
\t\t\t{"role": "user", "content": "Hello!"},
\t\t},
\t})

\treq, _ := http.NewRequest("POST", "${OAI_BASE}/chat/completions", bytes.NewBuffer(body))
\treq.Header.Set("Content-Type", "application/json")
\treq.Header.Set("Authorization", "Bearer sk-oort-your-key")

\tresp, _ := http.DefaultClient.Do(req)
\tdefer resp.Body.Close()
\tdata, _ := io.ReadAll(resp.Body)
\tfmt.Println(string(data))
}`;

  const javaExample = `import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;

public class OortAPIExample {
\tpublic static void main(String[] args) throws Exception {
\t\tString json = "{\\"model\\":\\"gpt-4o\\",\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"Hello!\\"}]}";

\t\tHttpRequest request = HttpRequest.newBuilder()
\t\t\t.uri(URI.create("${OAI_BASE}/chat/completions"))
\t\t\t.header("Content-Type", "application/json")
\t\t\t.header("Authorization", "Bearer sk-oort-your-key")
\t\t\t.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
\t\t\t.build();

\t\tHttpResponse<String> response = HttpClient.newHttpClient()
\t\t\t.send(request, HttpResponse.BodyHandlers.ofString());
\t\tSystem.out.println(response.body());
\t}
}`;

  const phpExample = `<?php
$ch = curl_init('${OAI_BASE}/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
\t'Content-Type: application/json',
\t'Authorization: Bearer sk-oort-your-key',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
\t'model' => 'gpt-4o',
\t'messages' => [['role' => 'user', 'content' => 'Hello!']],
]));

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;

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
    <div className="space-y-8">
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

      {/* More Languages: Go / Java / PHP */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Terminal className="h-5 w-5 text-teal-400" />
          {lang === "zh" ? "更多语言示例" : "More Language Examples"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "使用原生 HTTP 客户端直接调用 OortAPI，无需额外依赖。"
            : "Call OortAPI directly with native HTTP clients — no extra dependencies needed."}
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Go (net/http)</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {lang === "zh"
                ? "使用 Go 标准库 net/http 发起请求。"
                : "Make requests using Go's standard library net/http."}
            </p>
            <CodeBlock code={goExample} language="go" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Java (java.net.http)</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {lang === "zh"
                ? "使用 Java 11+ 内置 HttpClient 发起请求。"
                : "Make requests using Java 11+'s built-in HttpClient."}
            </p>
            <CodeBlock code={javaExample} language="java" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">PHP (cURL)</h3>
            <p className="text-xs text-muted-foreground mb-2">
              {lang === "zh"
                ? "使用 PHP cURL 扩展发起请求。"
                : "Make requests using PHP's cURL extension."}
            </p>
            <CodeBlock code={phpExample} language="php" />
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

      {/* Cross Links */}
      <CrossLinks links={[
        { title: lang === "zh" ? "流式输出" : "Streaming", href: "/docs/streaming", description: lang === "zh" ? "实时流式获取模型响应" : "Real-time streaming responses" },
        { title: lang === "zh" ? "API 端点" : "Endpoints", href: "/docs/endpoints", description: lang === "zh" ? "查看所有可用的 API 端点" : "View all available API endpoints" },
        { title: lang === "zh" ? "快速开始" : "Quick Start", href: "/docs/quickstart", description: lang === "zh" ? "3 分钟内发送你的第一个 API 请求" : "Send your first API request in under 3 minutes" },
      ]} />
    </div>
  );
}
