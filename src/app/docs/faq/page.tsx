import type { Metadata } from "next";
import { FaqContent } from "./client";

export const metadata: Metadata = {
  title: "FAQ — OortAPI Docs",
  description: "Frequently asked questions about OortAPI: API keys, billing, models, rate limits, streaming, and integration.",
};

export default function FaqPage() {
  return <FaqContent />;
}
