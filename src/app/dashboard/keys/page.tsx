"use client";

import { useI18n } from "@/contexts/i18n-context";
import { ApiKeyTable } from "@/components/dashboard/api-key-table";

export default function KeysPage() {
  const { lang, t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {t.dashboard.apiKeys}
      </h1>
      <ApiKeyTable lang={lang} />
    </div>
  );
}
