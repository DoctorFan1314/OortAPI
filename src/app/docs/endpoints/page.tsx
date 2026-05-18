"use client";

import { useI18n } from "@/contexts/i18n-context";
import { EndpointRow } from "@/components/docs/endpoint-row";
import { CreditCard, Users, Cpu } from "lucide-react";

export default function EndpointsPage() {
  const { t } = useI18n();
  const L = t.apiDocs;

  const sectionHeader =
    "flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider rounded-t-xl border-b";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">{L.endpointsTitle}</h1>
        <p className="text-muted-foreground">{L.endpointsDesc}</p>
      </div>

      {/* OpenAI Endpoints */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-sky-500/5 text-sky-400 border-sky-500/10`}>
          <Cpu className="h-4 w-4" />
          {L.aiModelEndpoints} (OpenAI)
        </div>
        <EndpointRow method="POST" path="/api/v1/chat/completions" description={L.chatCompletion} />
        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/v1/completions" description={L.textCompletion} />
        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/v1/embeddings" description={L.embeddings} />
        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/v1/images/generations" description={L.imageGen} />
        <div className="border-t border-border/20" />
        <EndpointRow method="GET" path="/api/v1/models" description={L.modelList} />
      </div>

      {/* Anthropic Endpoints */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-amber-500/5 text-amber-400 border-amber-500/10`}>
          <Cpu className="h-4 w-4" />
          {L.aiModelEndpoints} (Anthropic)
        </div>
        <EndpointRow method="POST" path="/api/v1/messages" description={L.messageCompletion} />
      </div>

      {/* Billing Endpoints */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-emerald-500/5 text-emerald-400 border-emerald-500/10`}>
          <CreditCard className="h-4 w-4" />
          {L.billingEndpoints}
        </div>
        <EndpointRow method="GET" path="/api/v1/billing/balance" description={L.balance} />
        <div className="border-t border-border/20" />
        <EndpointRow method="GET" path="/api/v1/billing/usage" description={L.usage} />
        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/v1/billing/redeem" description={L.redeem} />
      </div>

      {/* User Endpoints */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className={`${sectionHeader} bg-purple-500/5 text-purple-400 border-purple-500/10`}>
          <Users className="h-4 w-4" />
          {L.userEndpoints}
        </div>
        <EndpointRow method="POST" path="/api/auth/login" description="Login" />
        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/auth/register" description="Register" />
        <div className="border-t border-border/20" />
        <EndpointRow method="GET" path="/api/auth/me" description="Get Current User" />
        <div className="border-t border-border/20" />
        <EndpointRow method="PATCH" path="/api/auth/profile" description="Update Profile" />
        <div className="border-t border-border/20" />
        <EndpointRow method="POST" path="/api/auth/change-password" description="Change Password" />
      </div>
    </div>
  );
}
