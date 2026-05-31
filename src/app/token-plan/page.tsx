import type { Metadata } from "next";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "Pricing & Plans — OortAPI",
  description: "OortAPI subscription plans: pay-per-token billing, cache-aware pricing, multiple tiers for individuals and teams.",
};

export default function Page() {
  return <ClientPage />;
}
