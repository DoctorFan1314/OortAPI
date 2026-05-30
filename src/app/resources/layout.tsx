import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resource Center — OortAPI",
  description: "AI resource hub with cloud MCP servers, prompt templates, and agent client skills. One-click activation to the playground.",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
