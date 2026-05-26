"use client";
import { ToolConfigTemplate } from "@/components/docs/tool-config-template";
export default function Page() {
  return (
    <ToolConfigTemplate
      name="OpenCode"
      protocol="openai"
      installSteps={[
        { zh: "确保已安装 Node.js 18+", en: "Ensure Node.js 18+ is installed" },
        { zh: "执行 npm install -g opencode-ai", en: "Run: npm install -g opencode-ai" },
        { zh: "运行 opencode -v 验证安装", en: "Verify with: opencode -v" },
      ]}
      configSteps={[
        { zh: "创建配置文件 ~/.config/opencode/opencode.json", en: "Create ~/.config/opencode/opencode.json" },
        { zh: "设置 baseURL 为 OortAPI 的 OpenAI 兼容地址", en: "Set baseURL to OortAPI OpenAI-compatible endpoint" },
        { zh: "填入你的 API Key", en: "Fill in your API Key" },
      ]}
    />
  );
}
