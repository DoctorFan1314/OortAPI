"use client";

import { Settings2, RefreshCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Model {
  id: string;
  owned_by: string;
  display_name?: string;
  tags?: string[];
}

interface ApiKey {
  id: number;
  name: string;
  key_value: string;
  enabled: number;
}

interface PlaygroundParams {
  temperature: number;
  max_tokens: number;
  top_p: number;
  response_format: string;
  stop: string;
  seed: number;
  frequency_penalty: number;
  presence_penalty: number;
}

interface ParamPreset {
  label: { zh: string; en: string };
  params: Partial<PlaygroundParams>;
}

interface Props {
  models: Model[];
  keys: ApiKey[];
  selectedModel: string;
  selectedKeyId: number | null;
  endpoint: "openai" | "anthropic";
  params: PlaygroundParams;
  systemPrompt: string;
  showAdvancedParams: boolean;
  modelCaps: { vision: boolean; reasoning: boolean; tools: boolean };
  lang: string;
  t: Record<string, string>;
  paramPresets: ParamPreset[];
  capEntries: { key: string; label: string; color: string }[];
  onRefresh: () => void;
  onSelectModel: (modelId: string) => void;
  onSelectKey: (keyId: number | null) => void;
  onSetEndpoint: (ep: "openai" | "anthropic") => void;
  onUpdateParams: (updater: (p: PlaygroundParams) => PlaygroundParams) => void;
  onUpdateSystemPrompt: (value: string) => void;
  onToggleAdvanced: () => void;
}

export function ParamsPanel({
  models, keys, selectedModel, selectedKeyId, endpoint, params, systemPrompt,
  showAdvancedParams, modelCaps, lang, t, paramPresets, capEntries,
  onRefresh, onSelectModel, onSelectKey, onSetEndpoint, onUpdateParams,
  onUpdateSystemPrompt, onToggleAdvanced,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Model */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block flex items-center gap-2">
          {t.selectModel}
          <button onClick={onRefresh} className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <RefreshCw className="h-3 w-3" />
          </button>
        </label>
        <select
          className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-mono focus:border-primary focus:outline-none truncate"
          value={selectedModel}
          onChange={(e) => onSelectModel(e.target.value)}
        >
          {models.length === 0 && <option value="">{t.noModels}</option>}
          {Object.entries(
            models.reduce<Record<string, Model[]>>((acc, m) => {
              const g = m.owned_by || "unknown";
              if (!acc[g]) acc[g] = [];
              acc[g].push(m);
              return acc;
            }, {})
          ).map(([group, gmodels]) => (
            <optgroup key={group} label={group}>
              {gmodels.map((m) => (
                <option key={m.id} value={m.id}>{m.display_name || m.id}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {capEntries.filter((e) => modelCaps[e.key as keyof typeof modelCaps]).map((e) => (
            <span key={e.key} className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono", e.color)}>{e.label}</span>
          ))}
          {!capEntries.some((e) => modelCaps[e.key as keyof typeof modelCaps]) && (
            <span className="text-[10px] text-muted-foreground/60 font-mono">{t.noCapability}</span>
          )}
        </div>
      </div>

      {/* Key */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.selectKey}</label>
        <select
          className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-mono focus:border-primary focus:outline-none"
          value={selectedKeyId ?? ""}
          onChange={(e) => onSelectKey(e.target.value ? Number(e.target.value) : null)}
        >
          {keys.length === 0 && <option value="">{t.noKeys}</option>}
          {keys.map((k) => (
            <option key={k.id} value={k.id}>{k.name} ({k.key_value.slice(0, 12)}...)</option>
          ))}
        </select>
      </div>

      {/* Endpoint */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.endpoint}</label>
        <div className="flex rounded-md border border-input overflow-hidden">
          <button onClick={() => onSetEndpoint("openai")} className={cn("flex-1 h-8 text-xs font-medium transition-colors", endpoint === "openai" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.openai}</button>
          <button onClick={() => onSetEndpoint("anthropic")} className={cn("flex-1 h-8 text-xs font-medium transition-colors border-l border-input", endpoint === "anthropic" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.anthropic}</button>
        </div>
      </div>

      {/* Params */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t.params}</span>
        </div>
        {/* Presets */}
        <div className="flex gap-1 mb-3">
          {paramPresets.map((p) => {
            const label = p.label[lang as keyof typeof p.label] || p.label.en;
            const active = params.temperature === p.params.temperature && params.top_p === p.params.top_p;
            return (
              <button key={label} onClick={() => onUpdateParams((s) => ({ ...s, ...p.params }))}
                className={`px-2 py-1 text-[10px] font-medium rounded-full border transition-colors ${active ? "bg-primary/10 border-primary/30 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"}`}>
                {label}
              </button>
            );
          })}
        </div>
        <div className="space-y-3">
          {/* Temperature */}
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">{t.temperature}</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="2" step="0.1" value={params.temperature} onChange={(e) => onUpdateParams((s) => ({ ...s, temperature: parseFloat(e.target.value) }))} className="flex-1" />
              <span className="text-xs font-mono w-8 text-right text-foreground">{params.temperature.toFixed(1)}</span>
            </div>
          </div>
          {/* Max Tokens */}
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">{t.maxTokens}</label>
            <div className="space-y-1">
              <input type="range" min={256} max={131072} step={256} value={params.max_tokens} onChange={(e) => onUpdateParams((s) => ({ ...s, max_tokens: parseInt(e.target.value) }))} className="w-full" />
              <div className="flex items-center gap-1">
                <input type="number" min={256} max={131072} step={256} value={params.max_tokens} onChange={(e) => { const v = Math.min(131072, Math.max(256, parseInt(e.target.value) || 4096)); onUpdateParams((s) => ({ ...s, max_tokens: v })); }} className="w-full h-7 px-2 rounded border border-input bg-background text-xs font-mono" />
              </div>
              <div className="flex gap-1">
                {["1K", "4K", "8K", "32K", "128K"].map((label) => {
                  const val = label === "1K" ? 1024 : label === "4K" ? 4096 : label === "8K" ? 8192 : label === "32K" ? 32768 : 131072;
                  return (
                    <button key={label} onClick={() => onUpdateParams((s) => ({ ...s, max_tokens: val }))}
                      className={cn("flex-1 px-1 py-1 text-[10px] font-mono rounded border transition-colors", params.max_tokens === val ? "border-primary text-primary bg-primary/10" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-muted-foreground/30")}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Top P */}
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">{t.topP}</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="1" step="0.05" value={params.top_p} onChange={(e) => onUpdateParams((s) => ({ ...s, top_p: parseFloat(e.target.value) }))} className="flex-1" />
              <span className="text-xs font-mono w-8 text-right text-foreground">{params.top_p.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Advanced params */}
        <div className="mt-3 pt-3 border-t border-border/40">
          <button onClick={onToggleAdvanced} className="flex items-center gap-1.5 w-full text-left">
            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", showAdvancedParams && "rotate-180")} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t.advanced}</span>
          </button>
          {showAdvancedParams && (
            <div className="space-y-3 mt-3 animate-page-fade-in">
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.responseFormat}</label><div className="flex rounded-md border border-input overflow-hidden"><button onClick={() => onUpdateParams((s) => ({ ...s, response_format: "text" }))} className={cn("flex-1 h-7 text-[11px] font-medium transition-colors", params.response_format === "text" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.textFormat}</button><button onClick={() => onUpdateParams((s) => ({ ...s, response_format: "json" }))} className={cn("flex-1 h-7 text-[11px] font-medium transition-colors border-l border-input", params.response_format === "json" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground")}>{t.jsonObject}</button></div></div>
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.stopSequences}</label><input type="text" value={params.stop} onChange={(e) => onUpdateParams((s) => ({ ...s, stop: e.target.value }))} placeholder="comma, separated" className="w-full h-7 px-2 rounded border border-input bg-background text-xs font-mono" /></div>
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.seed}</label><input type="number" min={-1} max={999999} value={params.seed} onChange={(e) => { const v = parseInt(e.target.value) || -1; onUpdateParams((s) => ({ ...s, seed: v })); }} className="w-full h-7 px-2 rounded border border-input bg-background text-xs font-mono" /></div>
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.freqPenalty}</label><div className="flex items-center gap-2"><input type="range" min="0" max="2" step="0.1" value={params.frequency_penalty} onChange={(e) => onUpdateParams((s) => ({ ...s, frequency_penalty: parseFloat(e.target.value) }))} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.frequency_penalty.toFixed(1)}</span></div></div>
              <div><label className="text-[11px] text-muted-foreground block mb-1">{t.presPenalty}</label><div className="flex items-center gap-2"><input type="range" min="0" max="2" step="0.1" value={params.presence_penalty} onChange={(e) => onUpdateParams((s) => ({ ...s, presence_penalty: parseFloat(e.target.value) }))} className="flex-1" /><span className="text-xs font-mono w-8 text-right text-foreground">{params.presence_penalty.toFixed(1)}</span></div></div>
            </div>
          )}
        </div>
      </div>

      {/* System Prompt */}
      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 block">{t.systemPrompt}</label>
        <textarea value={systemPrompt} onChange={(e) => onUpdateSystemPrompt(e.target.value)} placeholder={t.systemPromptPH} rows={3} className="w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-xs font-mono resize-none focus:border-primary focus:outline-none" />
      </div>
    </div>
  );
}
