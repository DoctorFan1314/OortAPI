"use client";

import { ToolConfigTemplate } from "@/components/docs/tool-config-template";
export default function Page() {
  return (
    <ToolConfigTemplate
      name="OpenClaw"
      protocol="openai"
      configSteps={[
        { zh: "获取 OortAPI 的 Base URL 和 API Key", en: "Get OortAPI Base URL and API Key" },
        { zh: "在工具设置中填入 Base URL 和 API Key", en: "Enter Base URL and API Key in tool settings" },
        { zh: "选择支持的模型后开始使用", en: "Select a supported model and start using" },
      ]}
    />
  );
}
