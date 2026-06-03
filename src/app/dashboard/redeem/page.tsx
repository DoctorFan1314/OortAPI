"use client";

import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import useSWR from "swr";
import { dashboardSWRConfig } from "@/lib/swr-fetcher";
import { useToast } from "@/contexts/toast-context";
import { Gift, Loader2, Plus, Trash2, Copy, Check, Power, PowerOff, AlertTriangle } from "lucide-react";

interface RedeemCode {
  id: number;
  code: string;
  amount: number;
  code_type: string;
  plan_id: number | null;
  billing_cycle: string;
  duration_months: number;
  enabled: number;
  max_uses: number;
  current_uses: number;
  created_at: string;
  expires_at: string | null;
  plan_display_name?: string;
  plan_monthly_credits?: number;
}

interface Plan {
  id: number;
  display_name: string;
  monthly_credits: number;
}


export default function RedeemPage() {
  const { lang, t } = useI18n();
  const L = t.dashboard;
  const { toast: showToast } = useToast();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchTimer) clearTimeout(searchTimer);
    setSearchTimer(setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300));
  }

  const searchParam = debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : '';
  const { data: rawData, isLoading, error: fetchError, mutate } = useSWR<{ codes: RedeemCode[]; has_more: boolean }>(`/api/dashboard/redeem?page=${page}&limit=50${searchParam}`, dashboardSWRConfig);
  const codes = rawData?.codes || [];
  const hasMore = rawData?.has_more || false;

  const { data: plansData } = useSWR<{ plans: Plan[] }>("/api/plans", dashboardSWRConfig);
  const plans = plansData?.plans || [];

  // Generate dialog
  const [genOpen, setGenOpen] = useState(false);
  const [genCodeType, setGenCodeType] = useState<"balance" | "subscription">("balance");
  const [genAmount, setGenAmount] = useState("10");
  const [genCount, setGenCount] = useState("5");
  const [genMaxUses, setGenMaxUses] = useState("1");
  const [genExpires, setGenExpires] = useState("");
  const [genPlanId, setGenPlanId] = useState<number>(0);
  const [genDuration, setGenDuration] = useState("1");
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Delete dialog
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);

  async function handleGenerate() {
    if (genCodeType === "balance" && (!genAmount || parseFloat(genAmount) <= 0)) {
      showToast(L.pleaseEnterAmount, "error");
      return;
    }
    if (genCodeType === "subscription" && !genPlanId) {
      showToast(L.pleaseSelectPlan, "error");
      return;
    }
    setGenLoading(true);
    setGenResult([]);
    try {
      const body: Record<string, unknown> = {
        codeType: genCodeType,
        count: parseInt(genCount, 10),
        maxUses: parseInt(genMaxUses, 10),
        expiresAt: genExpires || undefined,
      };
      if (genCodeType === "balance") {
        body.amount = parseFloat(genAmount);
      } else {
        body.planId = genPlanId;
        body.durationMonths = parseInt(genDuration, 10);
        body.billingCycle = "monthly";
      }
      const res = await fetch("/api/dashboard/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.codes) {
        setGenResult(data.codes);
        mutate();
      } else {
        showToast(data.error || "Generation failed", "error");
      }
    } catch { showToast(L.networkError, "error"); }
    setGenLoading(false);
  }

  async function handleToggle(id: number, enabled: number) {
    const nextEnabled = !enabled;
    const redeemKey = `/api/dashboard/redeem?page=${page}&limit=50${searchParam}`;
    const optimisticData = rawData ? {
      ...rawData,
      codes: rawData.codes.map(c => c.id === id ? { ...c, enabled: nextEnabled ? 1 : 0 } : c),
    } : undefined;
    try {
      await mutate(
        async () => {
          const res = await fetch("/api/dashboard/redeem", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ id, enabled: nextEnabled }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Operation failed");
          }
          const refetch = await fetch(redeemKey, { credentials: "include" });
          return refetch.json();
        },
        { optimisticData, rollbackOnError: true, revalidate: false },
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : L.networkError, "error");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/dashboard/redeem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: deleteId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Delete failed", "error");
        setDeleteLoading(false);
        return;
      }
    } catch { showToast(L.networkError, "error"); setDeleteLoading(false); return; }
    setDeleteLoading(false);
    setDeleteId(null);
    mutate();
  }

  function copyAll() {
    navigator.clipboard.writeText(genResult.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const pageIds = codes.map(c => c.id);
    const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of pageIds) next.delete(id);
      } else {
        for (const id of pageIds) next.add(id);
      }
      return next;
    });
  }

  async function handleBatchAction(action: "enable" | "disable" | "delete") {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    setBatchLoading(true);
    try {
      if (action === "delete") {
        const res = await fetch("/api/dashboard/redeem", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ids }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          showToast(data.error || "Batch delete failed", "error");
        } else {
          showToast(L.batchCodesDeleted.replace("{count}", String(ids.length)), "success");
        }
      } else {
        const res = await fetch("/api/dashboard/redeem", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ ids, enabled: action === "enable" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          showToast(data.error || "Batch update failed", "error");
        } else {
          showToast((action === "enable" ? L.batchCodesEnabled : L.batchCodesDisabled).replace("{count}", String(ids.length)), "success");
        }
      }
    } catch { showToast(L.networkError, "error"); }
    setSelectedIds(new Set());
    setBatchLoading(false);
    setBatchDeleteOpen(false);
    mutate();
  }

  function getStatus(code: RedeemCode) {
    if (!code.enabled) return { label: L.inactive, cls: "bg-gray-500/10 text-gray-400 border-gray-500/20" };
    if (code.expires_at && new Date(code.expires_at) < new Date()) return { label: L.expired, cls: "bg-red-500/10 text-red-400 border-red-500/20" };
    if (code.current_uses >= code.max_uses) return { label: L.exhausted, cls: "bg-orange-500/10 text-orange-400 border-orange-500/20" };
    return { label: L.active, cls: "bg-green-500/10 text-green-400 border-green-500/20" };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Gift className="h-6 w-6" />{L.title}{!isLoading && <Badge variant="secondary" className="ml-1 text-xs">{codes.length}</Badge>}</h1>
        <Button onClick={() => { setGenOpen(true); setGenResult([]); }} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />{L.generate}
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 bg-primary/5">
              <span className="text-sm text-muted-foreground">{L.selected}: <strong className="text-foreground">{selectedIds.size}</strong></span>
              <div className="flex gap-1.5 ml-auto">
                <Button variant="outline" size="sm" onClick={() => handleBatchAction("enable")} disabled={batchLoading}>
                  <Power className="h-3.5 w-3.5 mr-1" />{L.batchEnable}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBatchAction("disable")} disabled={batchLoading}>
                  <PowerOff className="h-3.5 w-3.5 mr-1" />{L.batchDisable}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setBatchDeleteOpen(true)} disabled={batchLoading}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />{L.batchDelete}
                </Button>
              </div>
            </div>
          )}
          {codes.length > 5 && (
            <div className="px-4 py-2 border-b border-border/50">
              <Input
                placeholder={L.searchCodes}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="max-w-xs h-8 text-sm"
              />
            </div>
          )}
          {isLoading ? (
            <div className="h-48 animate-pulse bg-muted rounded-lg m-6" />
          ) : fetchError ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-8 w-8 text-destructive/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">{L.failedToLoad}</p>
              <Button variant="outline" size="sm" onClick={() => mutate()}>{L.retry}</Button>
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{L.noCodes}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th scope="col" className="text-left py-3 px-2 w-10">
                      <input type="checkbox" checked={codes.length > 0 && codes.every(c => selectedIds.has(c.id))} onChange={toggleSelectAll} className="rounded border-input" />
                    </th>
                    <th scope="col" className="text-left py-3 px-4 text-muted-foreground font-medium">{L.code}</th>
                    <th scope="col" className="text-center py-3 px-4 text-muted-foreground font-medium">{L.codeType}</th>
                    <th scope="col" className="text-right py-3 px-4 text-muted-foreground font-medium">{L.amount}</th>
                    <th scope="col" className="text-center py-3 px-4 text-muted-foreground font-medium">{L.uses}</th>
                    <th scope="col" className="text-center py-3 px-4 text-muted-foreground font-medium">{L.status}</th>
                    <th scope="col" className="text-right py-3 px-4 text-muted-foreground font-medium">{L.expires}</th>
                    <th scope="col" className="text-right py-3 px-4 text-muted-foreground font-medium">{L.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((c) => {
                    const st = getStatus(c);
                    return (
                      <tr key={c.id} className="border-b border-border/20 hover:bg-muted/30">
                        <td className="py-3 px-2">
                          <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-input" />
                        </td>
                        <td className="py-3 px-4 font-mono text-xs">{c.code}</td>
                        <td className="py-3 px-4 text-center">
                          {c.code_type === 'subscription' ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {c.plan_display_name || 'Subscription'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {L.balanceType}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          {c.code_type === 'subscription' ? (
                            <span className="text-xs">{c.duration_months}{L.monthUnit} / {(c.plan_monthly_credits || 0).toLocaleString()} credits</span>
                          ) : (
                            `$${c.amount.toFixed(2)}`
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-xs">{c.current_uses}/{c.max_uses}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="secondary" className={st.cls}>{st.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-xs text-muted-foreground">
                          {c.expires_at ? new Date(c.expires_at + "Z").toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleToggle(c.id, c.enabled)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xs" title={c.enabled ? L.disable : L.enable}>
                              {c.enabled ? L.disable : L.enable}
                            </button>
                            <button onClick={() => { navigator.clipboard.writeText(c.code); showToast(L.copied, "success"); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title={L.copyCode} aria-label={L.copyCode}>
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors" title={L.delete} aria-label={L.delete}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {(page > 1 || hasMore) && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</Button>
          <span className="text-sm text-muted-foreground py-1.5">{L.pageLabel} {page}</span>
          <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage(p => p + 1)}>→</Button>
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={genOpen} onOpenChange={(open) => { if (!open) { setGenOpen(false); setGenResult([]); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{L.generate}</DialogTitle>
          </DialogHeader>
          {genResult.length === 0 ? (
            <div className="space-y-4 py-2">
              {/* Code type toggle */}
              <div>
                <label className="text-sm text-foreground mb-1.5 block">{L.codeType}</label>
                <div className="flex gap-2">
                  <button onClick={() => setGenCodeType("balance")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${genCodeType === "balance" ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary text-muted-foreground border-border"}`}>{L.balanceType}</button>
                  <button onClick={() => setGenCodeType("subscription")} className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${genCodeType === "subscription" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-secondary text-muted-foreground border-border"}`}>{L.subType}</button>
                </div>
              </div>

              {genCodeType === "balance" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-foreground mb-1.5 block">{L.amount}</label>
                    <Input type="number" min="0.01" step="0.01" value={genAmount} onChange={(e) => setGenAmount(e.target.value)} className="bg-secondary border-border" autoFocus />
                  </div>
                  <div>
                    <label className="text-sm text-foreground mb-1.5 block">{L.count}</label>
                    <Input type="number" min="1" max="100" value={genCount} onChange={(e) => setGenCount(e.target.value)} className="bg-secondary border-border" />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-foreground mb-1.5 block">{L.selectPlan}</label>
                    <select className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm" value={genPlanId} onChange={e => setGenPlanId(+e.target.value)}>
                      <option value={0}>{L.selectPlan}</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.display_name} ({p.monthly_credits.toLocaleString()} credits)</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-foreground mb-1.5 block">{L.duration}</label>
                      <Input type="number" min="1" max="12" value={genDuration} onChange={(e) => setGenDuration(e.target.value)} className="bg-secondary border-border" />
                    </div>
                    <div>
                      <label className="text-sm text-foreground mb-1.5 block">{L.count}</label>
                      <Input type="number" min="1" max="100" value={genCount} onChange={(e) => setGenCount(e.target.value)} className="bg-secondary border-border" />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-foreground mb-1.5 block">{L.maxUses}</label>
                  <Input type="number" min="1" value={genMaxUses} onChange={(e) => setGenMaxUses(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm text-foreground mb-1.5 block">{L.expiresAt}</label>
                  <Input type="datetime-local" value={genExpires} onChange={(e) => setGenExpires(e.target.value)} className="bg-secondary border-border" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setGenOpen(false)}>{L.cancel}</Button>
                <Button onClick={handleGenerate} disabled={genLoading || (genCodeType === "subscription" && !genPlanId)}>{genLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : L.create}</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{L.batchResult} ({genResult.length})</p>
                <Button variant="outline" size="sm" onClick={copyAll}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? L.copied : L.copyAll}
                </Button>
              </div>
              <div className="bg-secondary rounded-lg p-3 max-h-60 overflow-y-auto">
                {genResult.map((c, i) => (
                  <div key={i} className="font-mono text-sm py-0.5">{c}</div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => { setGenOpen(false); setGenResult([]); }}>{L.cancel}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{L.delete}</DialogTitle>
            <DialogDescription>
              {L.deleteConfirm}
              <br />
              <code className="text-xs">{codes.find(c => c.id === deleteId)?.code}</code>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>{L.cancel}</Button>
            <Button onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 text-white hover:bg-red-700">
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : L.delete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Dialog */}
      <Dialog open={batchDeleteOpen} onOpenChange={(open) => { if (!open) setBatchDeleteOpen(false); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{L.batchDelete}</DialogTitle>
            <DialogDescription>{L.batchDeleteConfirm}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setBatchDeleteOpen(false)}>{L.cancel}</Button>
            <Button onClick={() => handleBatchAction("delete")} disabled={batchLoading} className="bg-red-600 text-white hover:bg-red-700">
              {batchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : L.batchDelete}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
