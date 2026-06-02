import type { Metadata } from "next";
import { ChangelogContent } from "./client";

export const metadata: Metadata = {
  title: "Changelog — OortAPI Docs",
  description: "All notable changes to the OortAPI API, including new features, bug fixes, and improvements.",
};

export default function ChangelogPage() {
  return <ChangelogContent />;
}
