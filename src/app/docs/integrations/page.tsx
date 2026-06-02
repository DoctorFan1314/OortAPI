import type { Metadata } from "next";
import { IntegrationsContent } from "./client";

export const metadata: Metadata = {
  title: "Integrations — OortAPI Docs",
  description: "Connect OortAPI to ChatBox, Cherry Studio, Open WebUI, NextChat, LobeChat, Claude Code, and other AI clients.",
  alternates: {
    canonical: "/docs/integrations",
  },
};

export default function IntegrationsPage() {
  return <IntegrationsContent />;
}
