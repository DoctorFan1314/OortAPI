import type { Metadata } from "next";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "System Status — OortAPI",
  description: "Real-time system status for OortAPI: platform health, upstream provider status, and incident history.",
};

export default function Page() {
  return <ClientPage />;
}
