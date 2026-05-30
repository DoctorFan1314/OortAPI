import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud MCP Ecosystem — OortAPI",
  description: "Discover and activate cloud MCP servers. Real open-source integrations from modelcontextprotocol/servers and established repos.",
};

export default function McpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
