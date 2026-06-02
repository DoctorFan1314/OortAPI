import type { Metadata } from "next";
import { ErrorsContent } from "./client";

export const metadata: Metadata = {
  title: "Error Codes — OortAPI Docs",
  description: "Complete HTTP error code reference with troubleshooting guides. Covers 400, 401, 402, 429, 500, 502, 503 errors and retry strategies.",
  alternates: {
    canonical: "/docs/errors",
  },
};

export default function ErrorsPage() {
  return <ErrorsContent />;
}
