"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { CrossLinks } from "@/components/docs/cross-links";

const openaiStream = `data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"},"index":0}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"!"},"index":0}]}

data: [DONE]`;

const openaiUsage = `data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}

data: [DONE]`;

const anthropicStream = `event: message_start
data: {"type":"message_start","message":{"id":"msg_xxx","content":[],"model":"claude-sonnet-4-20250514"}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"!"}}

event: message_stop
data: {"type":"message_stop"}`;

export function StreamingContent() {
  const { t, lang } = useI18n();
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const baseUrl = origin || "http://localhost:3000";

  const fetchStream = `const response = await fetch("${baseUrl}/api/v1/chat/completions", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer sk-oortapi-your-key",
  },
  body: JSON.stringify({
    model: "gpt-4o",
    stream: true,
    messages: [{ role: "user", content: "Hello!" }],
  }),
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  const lines = chunk.split("\\n").filter(l => l.startsWith("data: ") && l !== "data: [DONE]");
  for (const line of lines) {
    const json = JSON.parse(line.slice(6));
    console.log(json.choices[0]?.delta?.content || "");
  }
}`;

  const pythonStream = `import openai

client = openai.OpenAI(
    api_key="sk-oortapi-your-key",
    base_url="${baseUrl}/api/v1"
)

stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True,
    stream_options={"include_usage": True}
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
    # Usage info is in the last chunk
    if chunk.usage:
        print(f"\\nTokens: {chunk.usage.total_tokens}")`;

  const nodeStream = `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-oortapi-your-key",
  baseURL: "${baseUrl}/api/v1",
});

const stream = await client.chat.completions.create({
  model: "gpt-4o",
  messages: [{ role: "user", content: "Hello!" }],
  stream: true,
  stream_options: { include_usage: true },
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content;
  if (content) process.stdout.write(content);
  // Usage info is in the last chunk
  if (chunk.usage) {
    console.log("\\nTokens:", chunk.usage.total_tokens);
  }
}`;

  const anthropicStreamPy = `import anthropic

client = anthropic.Anthropic(
    api_key="sk-oortapi-your-key",
    base_url="${baseUrl}/api"
)

with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)`;

  const anthropicStreamNode = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "sk-oortapi-your-key",
  baseURL: "${baseUrl}/api",
});

const stream = client.messages.stream({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});

for await (const event of stream) {
  if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
    process.stdout.write(event.delta.text);
  }
}`;

  const errorHandling = `stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True,
)

full_response = ""
try:
    for chunk in stream:
        content = chunk.choices[0]?.delta?.content
        if content:
            full_response += content
            yield content  # or print(content)
except openai.APIError as e:
    print(f"API error: {e.status_code} - {e.message}")
except Exception as e:
    print(f"Stream interrupted: {e}")`;

  const L = t.apiDocs;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.streamTitle}</h1>
        <p className="text-muted-foreground">{L.streamDesc}</p>
      </div>

      {/* Two-column comparison */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* OpenAI */}
        <div className="rounded-xl border border-sky-500/20 overflow-hidden">
          <div className="bg-sky-500/5 px-5 py-3 border-b border-sky-500/10">
            <h2 className="text-sm font-semibold text-sky-400">{L.streamOpenai}</h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {L.streamOpenaiDesc}
            </p>
            <CodeBlock code={openaiStream} />
          </div>
        </div>

        {/* Anthropic */}
        <div className="rounded-xl border border-amber-500/20 overflow-hidden">
          <div className="bg-amber-500/5 px-5 py-3 border-b border-amber-500/10">
            <h2 className="text-sm font-semibold text-amber-400">{L.streamAnthropic}</h2>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {L.streamAnthropicDesc}
            </p>
            <CodeBlock code={anthropicStream} />
          </div>
        </div>
      </div>

      {/* OpenAI usage info */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/10 px-5 py-3 border-b border-border/20">
          <h2 className="text-sm font-semibold">{L.streamOpenai} &mdash; stream_options.include_usage</h2>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-xs text-muted-foreground">
            {lang === "zh"
              ? "设置 stream_options: { include_usage: true } 可在最后一个 chunk 中获取用量信息。"
              : "Set stream_options: { include_usage: true } to receive usage info in the final chunk."}
          </p>
          <CodeBlock code={openaiUsage} />
        </div>
      </div>

      {/* SDK Examples */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "SDK 流式示例" : "SDK Streaming Examples"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "使用官方 SDK 可以更方便地处理流式响应。以下是 Python 和 Node.js 的示例。"
            : "Using the official SDKs makes streaming easier. Here are Python and Node.js examples."}
        </p>
      </section>

      {/* Python SDK */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/10 px-5 py-3 border-b border-border/20">
          <h2 className="text-sm font-semibold">Python SDK {lang === "zh" ? "流式" : "Streaming"}</h2>
        </div>
        <div className="p-5">
          <CodeBlock code={pythonStream} language="python" />
        </div>
      </div>

      {/* Node.js SDK */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="bg-muted/10 px-5 py-3 border-b border-border/20">
          <h2 className="text-sm font-semibold">Node.js SDK {lang === "zh" ? "流式" : "Streaming"}</h2>
        </div>
        <div className="p-5">
          <CodeBlock code={nodeStream} language="javascript" />
        </div>
      </div>

      {/* Anthropic SDK */}
      <div className="rounded-xl border border-amber-500/20 overflow-hidden">
        <div className="bg-amber-500/5 px-5 py-3 border-b border-amber-500/10">
          <h2 className="text-sm font-semibold text-amber-400">Anthropic Python SDK {lang === "zh" ? "流式" : "Streaming"}</h2>
        </div>
        <div className="p-5">
          <CodeBlock code={anthropicStreamPy} language="python" />
        </div>
      </div>

      {/* Anthropic Node.js SDK */}
      <div className="rounded-xl border border-amber-500/20 overflow-hidden">
        <div className="bg-amber-500/5 px-5 py-3 border-b border-amber-500/10">
          <h2 className="text-sm font-semibold text-amber-400">Anthropic Node.js SDK {lang === "zh" ? "流式" : "Streaming"}</h2>
        </div>
        <div className="p-5">
          <CodeBlock code={anthropicStreamNode} language="javascript" />
        </div>
      </div>

      {/* Error Handling */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "流式错误处理" : "Streaming Error Handling"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "流式请求可能因网络中断或上游错误而失败。建议在流式处理中添加异常捕获："
            : "Streaming requests may fail due to network interruptions or upstream errors. Add exception handling to your stream processing:"}
        </p>
        <CodeBlock code={errorHandling} language="python" />
      </section>

      {/* Consumer example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{lang === "zh" ? "浏览器 fetch 消费示例" : "Browser fetch Consumer Example"}</h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "以下示例演示如何使用 fetch API 在浏览器中消费流式响应。"
            : "The example below shows how to consume a streaming response using the fetch API in the browser."}
        </p>
        <CodeBlock code={fetchStream} language="javascript" />
      </section>

      {/* Cross Links */}
      <CrossLinks links={[
        { title: lang === "zh" ? "API 端点" : "Endpoints", href: "/docs/endpoints", description: lang === "zh" ? "查看所有可用的 API 端点" : "View all available API endpoints" },
        { title: lang === "zh" ? "SDK 集成" : "SDK Integration", href: "/docs/sdk", description: lang === "zh" ? "使用 Python/Node.js SDK 接入" : "Use Python/Node.js SDKs" },
        { title: lang === "zh" ? "错误码" : "Error Codes", href: "/docs/errors", description: lang === "zh" ? "错误码含义与故障排除" : "Error code meanings and troubleshooting" },
      ]} />
    </div>
  );
}
