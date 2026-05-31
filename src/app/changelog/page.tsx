import type { Metadata } from "next";
import ClientPage from "./client";

export const metadata: Metadata = {
  title: "Changelog — OortAPI",
  description: "OortAPI release notes and version history. Track new features, API changes, and improvements.",
};

export default function Page() {
  return <ClientPage />;
}
