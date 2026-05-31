import type { Metadata } from "next";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "FAQ — OortAPI",
  description: "Frequently asked questions about OortAPI: API keys, billing, models, rate limits, integration, and troubleshooting.",
};

export default function Page() {
  return <ClientPage />;
}
