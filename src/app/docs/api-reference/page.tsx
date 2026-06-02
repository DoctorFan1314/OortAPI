import type { Metadata } from "next";
import { ApiReferenceContent } from "./client";

export const metadata: Metadata = {
  title: "Interactive API Reference — OortAPI Docs",
  description: "Explore and test the OortAPI endpoints interactively with Swagger UI.",
};

export default function ApiReferencePage() {
  return <ApiReferenceContent />;
}
