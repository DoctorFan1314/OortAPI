import type { Metadata } from "next";
import { ModelsPricingContent } from "./client";

export const metadata: Metadata = {
  title: "Models & Pricing — OortAPI Docs",
  description: "Browse available AI models and pricing. Token-based billing with cache-aware rates across OpenAI, Anthropic, Google, and more.",
};

export default function ModelsPricingPage() {
  return <ModelsPricingContent />;
}
