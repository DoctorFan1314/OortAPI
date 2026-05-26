"use client";
import { ToolConfigTemplate } from "@/components/docs/tool-config-template";
export default function Page() {
  return (
    <ToolConfigTemplate
      name="OpenAI Codex"
      protocol="openai"
      configSteps={[
        { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
        { zh: "在 OpenAI Codex 中设置自定义 API 端点", en: "Set custom API endpoint in Codex" },
        { zh: "填入你的 API Key 并选择模型", en: "Enter your API Key and select a model" },
      ]}
    />
  );
}
