import type { Metadata } from "next";
import { SecurityContent } from "./client";

export const metadata: Metadata = {
  title: "Security — OortAPI Docs",
  description: "Security best practices for API key management, data privacy, request logging, and HTTPS enforcement.",
  alternates: {
    canonical: "/docs/security",
  },
};

export default function SecurityPage() {
  return <SecurityContent />;
}
