"use client";

import { useI18n } from "@/contexts/i18n-context";
import { CodeBlock } from "@/components/docs/code-block";
import { CrossLinks } from "@/components/docs/cross-links";
import {
  Play,
  MessageSquare,
  Sliders,
  Wrench,
  Download,
  Lightbulb,
  ArrowRight,
} from "lucide-react";

const exportExample = `{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Explain quantum computing in simple terms." },
    { "role": "assistant", "content": "Quantum computing uses..." }
  ],
  "model": "gpt-4o",
  "temperature": 0.7,
  "max_tokens": 1024
}`;

const toolCallingPlayground = `{
  "model": "gpt-4o",
  "messages": [{ "role": "user", "content": "What's the weather in Tokyo?" }],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": { "type": "string" }
          },
          "required": ["city"]
        }
      }
    }
  ]
}`;

export function PlaygroundContent() {
  const { lang } = useI18n();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Play className="h-6 w-6" />
          {lang === "zh" ? "API Playground" : "API Playground"}
        </h1>
        <p className="text-muted-foreground">
          {lang === "zh"
            ? "API Playground 是一个交互式 API 测试工具，让你无需编写代码即可测试模型、调试提示词和探索参数配置。"
            : "The API Playground is an interactive testing tool that lets you test models, debug prompts, and explore parameter configurations without writing any code."}
        </p>
      </div>

      {/* What is the Playground */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "什么是 Playground？" : "What is the Playground?"}
        </h2>
        <div className="rounded-xl border border-border/50 glass-card p-6 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lang === "zh"
              ? "Playground 提供了一个类似聊天的界面，你可以直接在浏览器中与模型交互。它支持所有通过 OortAPI 中继的模型，并提供实时参数调整、工具调用测试和对话导出等功能。"
              : "The Playground provides a chat-like interface where you can interact with models directly in your browser. It supports all models available through the OortAPI relay and offers real-time parameter tuning, tool calling tests, and conversation export."}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {lang === "zh"
              ? "它是调试提示词、比较模型输出和快速原型验证的理想工具。"
              : "It is the ideal tool for debugging prompts, comparing model outputs, and rapid prototyping."}
          </p>
        </div>
      </section>

      {/* How to Access */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-primary" />
          {lang === "zh" ? "如何访问" : "How to Access"}
        </h2>
        <div className="rounded-lg border border-border/50 p-4 text-sm space-y-2">
          <ol className="text-muted-foreground space-y-2 list-decimal pl-4">
            <li>
              {lang === "zh"
                ? "登录 OortAPI 控制台"
                : "Log in to the OortAPI Dashboard"}
            </li>
            <li>
              {lang === "zh"
                ? '在左侧导航栏中点击 "Playground"'
                : 'Click "Playground" in the left sidebar'}
            </li>
            <li>
              {lang === "zh"
                ? "选择模型并开始对话"
                : "Select a model and start your conversation"}
            </li>
          </ol>
          <p className="text-xs text-muted-foreground mt-2">
            {lang === "zh"
              ? "路径：控制台 → Playground"
              : "Path: Dashboard → Playground"}
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "功能特性" : "Features"}
        </h2>

        {/* Chat Interface */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-card">
          <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">
              {lang === "zh" ? "聊天界面" : "Chat Interface"}
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "zh"
                ? "直观的多轮对话界面，支持 Markdown 渲染和代码高亮。你可以发送文本消息、添加系统提示词，并实时查看模型响应。"
                : "An intuitive multi-turn chat interface with Markdown rendering and code highlighting. Send text messages, add system prompts, and view model responses in real time."}
            </p>
            <ul className="space-y-1.5">
              {(lang === "zh"
                ? [
                    "支持多轮对话，自动维护上下文",
                    "Markdown 和代码块实时渲染",
                    "支持中断正在生成的响应",
                    "显示 token 用量和延迟统计",
                  ]
                : [
                    "Multi-turn conversations with automatic context management",
                    "Real-time Markdown and code block rendering",
                    "Interrupt responses mid-generation",
                    "Token usage and latency statistics display",
                  ]
              ).map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Model Selection */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-card">
          <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">
              {lang === "zh" ? "模型选择与参数调整" : "Model Selection & Parameter Tuning"}
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "zh"
                ? "从下拉菜单中选择任意已配置的模型，并实时调整生成参数。"
                : "Select any configured model from the dropdown and tune generation parameters in real time."}
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {(lang === "zh"
                ? [
                    { name: "Temperature", desc: "控制输出的随机性（0-2）" },
                    { name: "Max Tokens", desc: "设置最大输出长度" },
                    { name: "Top P", desc: "核采样参数（0-1）" },
                    { name: "Frequency Penalty", desc: "降低重复 token 的概率" },
                    { name: "Presence Penalty", desc: "鼓励模型谈论新话题" },
                    { name: "System Prompt", desc: "设置系统级指令" },
                  ]
                : [
                    { name: "Temperature", desc: "Control output randomness (0-2)" },
                    { name: "Max Tokens", desc: "Set maximum output length" },
                    { name: "Top P", desc: "Nucleus sampling parameter (0-1)" },
                    { name: "Frequency Penalty", desc: "Reduce repetition of frequent tokens" },
                    { name: "Presence Penalty", desc: "Encourage new topic exploration" },
                    { name: "System Prompt", desc: "Set system-level instructions" },
                  ]
              ).map((param) => (
                <div key={param.name} className="rounded-lg border border-border/30 p-3">
                  <code className="text-xs font-mono text-primary">{param.name}</code>
                  <p className="text-xs text-muted-foreground mt-1">{param.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tool Calling */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-card">
          <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">
              {lang === "zh" ? "工具调用测试" : "Tool Calling"}
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "zh"
                ? "在 Playground 中定义和测试工具（函数调用），验证模型是否正确调用你的函数。"
                : "Define and test tools (function calls) in the Playground to verify that models correctly invoke your functions."}
            </p>
            <CodeBlock code={toolCallingPlayground} language="json" />
            <ul className="space-y-1.5">
              {(lang === "zh"
                ? [
                    "在 UI 中直接定义工具的 JSON Schema",
                    "查看模型返回的工具调用参数",
                    "模拟工具响应并继续对话",
                    "支持并行工具调用测试",
                  ]
                : [
                    "Define tool JSON Schemas directly in the UI",
                    "Inspect tool call parameters returned by the model",
                    "Simulate tool responses and continue the conversation",
                    "Support for parallel tool call testing",
                  ]
              ).map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Conversation Export */}
        <div className="rounded-xl border border-border/50 overflow-hidden glass-card">
          <div className="px-6 py-4 border-b border-border/30 flex items-center gap-3">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">
              {lang === "zh" ? "对话导出" : "Conversation Export"}
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {lang === "zh"
                ? "将 Playground 中的对话导出为 JSON 格式，方便在代码中复现相同的请求。导出内容包含完整的消息历史、模型名称和所有参数配置。"
                : "Export your Playground conversation as JSON to easily reproduce the same request in code. The export includes the full message history, model name, and all parameter configurations."}
            </p>
            <CodeBlock code={exportExample} language="json" />
            <p className="text-xs text-muted-foreground">
              {lang === "zh"
                ? "导出的 JSON 可以直接作为 API 请求体使用。"
                : "The exported JSON can be used directly as an API request body."}
            </p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          {lang === "zh" ? "使用技巧" : "Tips for Effective Testing"}
        </h2>
        <ul className="text-sm text-muted-foreground space-y-2.5 list-none pl-0">
          {(lang === "zh"
            ? [
                "使用系统提示词设定模型的角色和行为边界",
                "逐步调整 Temperature：低值（0-0.3）适合精确任务，高值（0.7-1.5）适合创意任务",
                "利用对话导出功能将调试好的提示词直接集成到代码中",
                "对比不同模型在同一提示词下的输出质量",
                "使用工具调用功能测试函数定义是否清晰、参数是否正确",
                "保存常用提示词模板，方便重复测试",
              ]
            : [
                "Use system prompts to define the model's role and behavioral boundaries",
                "Adjust Temperature gradually: low (0-0.3) for precise tasks, high (0.7-1.5) for creative tasks",
                "Use conversation export to integrate debugged prompts directly into your code",
                "Compare outputs from different models on the same prompt",
                "Use tool calling to test whether function definitions are clear and parameters are correct",
                "Save frequently used prompt templates for repeated testing",
              ]
          ).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Code integration example */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          {lang === "zh" ? "从 Playground 到代码" : "From Playground to Code"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "zh"
            ? "在 Playground 中调试好提示词后，可以直接复制导出的 JSON 并在代码中使用："
            : "Once you have debugged your prompt in the Playground, copy the exported JSON and use it directly in code:"}
        </p>
        <CodeBlock
          code={`import openai

client = openai.OpenAI(
    api_key="sk-oort-your-key",
    base_url="https://api.oortapi.com/v1"
)

# Paste your Playground export here
response = client.chat.completions.create(
    model="gpt-4o",
    temperature=0.7,
    max_tokens=1024,
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."}
    ]
)

print(response.choices[0].message.content)`}
          language="python"
        />
      </section>

      {/* Cross Links */}
      <CrossLinks
        links={[
          {
            title: lang === "zh" ? "功能总览" : "Features",
            href: "/docs/features",
            description:
              lang === "zh"
                ? "了解 OortAPI 支持的所有功能"
                : "Learn about all OortAPI capabilities",
          },
          {
            title: lang === "zh" ? "模型与定价" : "Models & Pricing",
            href: "/docs/models-pricing",
            description:
              lang === "zh"
                ? "查看可用模型及其价格"
                : "View available models and their pricing",
          },
          {
            title: lang === "zh" ? "API 端点" : "Endpoints",
            href: "/docs/endpoints",
            description:
              lang === "zh"
                ? "查看所有可用的 API 端点"
                : "View all available API endpoints",
          },
        ]}
      />
    </div>
  );
}
