import type { Metadata } from "next";
import { AuthenticationContent } from "./client";

export const metadata: Metadata = {
  title: "Authentication — OortAPI Docs",
  description: "Learn how to authenticate with OpenAI and Anthropic API keys. Configure Bearer tokens and x-api-key headers.",
  alternates: {
    canonical: "/docs/authentication",
  },
};

export default function AuthenticationPage() {
  return <AuthenticationContent />;
}
