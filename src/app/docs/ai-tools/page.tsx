import type { Metadata } from "next";
import { AiToolsClient } from "./client";

export const metadata: Metadata = {
  title: "AI Tools — OortAPI Docs",
  description: "Configure AI coding tools like Claude Code, Cursor, Windsurf, OpenAI Codex, and more to use OortAPI as their backend.",
  alternates: {
    canonical: "/docs/ai-tools",
  },
};

export default function AiToolsPage() {
  return <AiToolsClient />;
}
