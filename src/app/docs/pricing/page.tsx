import type { Metadata } from "next";
import { PricingContent } from "./client";

export const metadata: Metadata = {
  title: "Pricing — OortAPI Docs",
  description: "OortAPI pricing details: input tokens, completion tokens, cache read, and cache create billing tiers.",
  alternates: {
    canonical: "/docs/pricing",
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
