import type { Metadata } from "next";
import { RateLimitsContent } from "./client";

export const metadata: Metadata = {
  title: "Rate Limits — OortAPI Docs",
  description: "Understand API rate limits, TPM thresholds, and tier-based quotas. Includes exponential backoff retry examples.",
};

export default function RateLimitsPage() {
  return <RateLimitsContent />;
}
