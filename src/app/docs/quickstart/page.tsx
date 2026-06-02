import type { Metadata } from "next";
import { QuickStartContent } from "./client";

export const metadata: Metadata = {
  title: "Quick Start — OortAPI Docs",
  description: "Get started with OortAPI in 3 minutes. Send your first API request with cURL, Python, or Node.js.",
};

export default function QuickstartPage() {
  return <QuickStartContent />;
}
