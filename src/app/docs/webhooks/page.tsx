import type { Metadata } from "next";
import { WebhooksContent } from "./client";

export const metadata: Metadata = {
  title: "Webhooks — OortAPI Docs",
  description:
    "Learn how to configure and verify webhook notifications for events like low balance, subscription changes, and renewal failures.",
  alternates: {
    canonical: "/docs/webhooks",
  },
};

export default function WebhooksPage() {
  return <WebhooksContent />;
}
