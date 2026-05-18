"use client";

import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Clock, Layers, Plus, Trash2, Save } from "lucide-react";
import { useToast } from "@/contexts/toast-context";

interface MultiplierRule {
  id: number;
  model_name: string;
  multiplier: number;
  enabled: number;
  description: string | null;
  input_rate: number | null;
  output_rate: number | null;
}

interface TimeSettings {
  day_start: string;
  day_end: string;
  day_rate: number;
  night_rate: number;
  timezone: string;
  enabled: number;
}

const LABELS = {
  zh: {
    title: "倍率管理",
    regular: "常规倍率规则",
    timeBased: "时段倍率规则",
    model: "模型名称",
    multiplier: "倍率",
    description: "说明",
    enabled: "启用",
    actions: "操作",
    delete: "删除",
    add: "添加规则",
    save: "保存",
    noRules: "暂无常规倍率规则",
    dayStart: "白天开始",
    dayEnd: "白天结束",
    dayRate: "白天倍率",
    nightRate: "夜间倍率",
    timezone: "时区",
    enableTime: "启用时段倍率",
    timeDesc: "优先级高于常规倍率。设置白天和夜间的不同倍率，适用于按时段差异化定价。",
    regularDesc: "按模型设置固定倍率，最终价格 = 基础价格 × 倍率。",
    effectiveInput: "生效输入价",
    effectiveOutput: "生效输出价",
    batchEdit: "批量编辑",
    batchEditTitle: "批量修改倍率",
    batchEditDesc: "为选中的规则设置新的倍率值",
    selected: "已选 {count} 个",
    newMultiplier: "新倍率",
    apply: "应用",
    cancel: "取消",
  },
  en: {
    title: "Multiplier Rules",
    regular: "Regular Multiplier Rules",
    timeBased: "Time-based Multiplier Rules",
    model: "Model Name",
    multiplier: "Multiplier",
    description: "Description",
    enabled: "Enabled",
    actions: "Actions",
    delete: "Delete",
    add: "Add Rule",
    save: "Save",
    noRules: "No regular multiplier rules yet",
    dayStart: "Day Start",
    dayEnd: "Day End",
    dayRate: "Day Rate",
    nightRate: "Night Rate",
    timezone: "Timezone",
    enableTime: "Enable Time-based Multiplier",
    timeDesc: "Higher priority than regular rules. Set different multipliers for day and night periods.",
    regularDesc: "Set a fixed multiplier per model. Final price = base price × multiplier.",
    effectiveInput: "Effective Input",
    effectiveOutput: "Effective Output",
    batchEdit: "Batch Edit",
    batchEditTitle: "Batch Edit Multiplier",
    batchEditDesc: "Set a new multiplier value for selected rules",
    selected: "{count} selected",
    newMultiplier: "New Multiplier",
    apply: "Apply",
    cancel: "Cancel",
  },
};

export default function MultiplierPage() {
  const { lang } = useI18n();
  const t = LABELS[lang];
  const { toast: showToast } = useToast();
  const [rules, setRules] = useState<MultiplierRule[]>([]);
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    day_start: '08:00', day_end: '22:00', day_rate: 1.0, night_rate: 0.5, timezone: 'Asia/Shanghai', enabled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [newModel, setNewModel] = useState('');
  const [newMultiplier, setNewMultiplier] = useState('1.0');
  const [newDesc, setNewDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [batchMultValue, setBatchMultValue] = useState('1.0');
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  const fetchData = () => {
    fetch('/api/dashboard/multiplier', { credentials: 'include' })
      .then(res => res.json())
      .then(d => {
        setRules(d.rules || []);
        if (d.time_settings) setTimeSettings(d.time_settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddRule = () => {
    if (!newModel.trim()) return;
    fetch('/api/dashboard/multiplier', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: newModel.trim(), multiplier: parseFloat(newMultiplier) || 1.0, enabled: true, description: newDesc || null }),
    }).then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => { setNewModel(''); setNewMultiplier('1.0'); setNewDesc(''); fetchData(); })
      .catch(() => showToast(lang === "zh" ? "添加失败" : "Failed to add rule", "error"));
  };

  const handleDeleteRule = (modelName: string) => {
    setDeleteTarget(modelName);
  };

  const confirmDeleteRule = () => {
    if (!deleteTarget) return;
    fetch('/api/dashboard/multiplier', {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: deleteTarget }),
    }).then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => { setDeleteTarget(null); fetchData(); })
      .catch(() => { showToast(lang === "zh" ? "删除失败" : "Failed to delete rule", "error"); setDeleteTarget(null); });
  };

  const handleToggleRule = (rule: MultiplierRule) => {
    fetch('/api/dashboard/multiplier', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model_name: rule.model_name, multiplier: rule.multiplier, enabled: !rule.enabled, description: rule.description }),
    }).then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => fetchData())
      .catch(() => showToast(lang === "zh" ? "更新失败" : "Failed to update rule", "error"));
  };

  const handleSaveTimeSettings = () => {
    fetch('/api/dashboard/multiplier', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'time_settings', ...timeSettings }),
    }).then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => showToast(lang === "zh" ? "已保存" : "Saved", "success"))
      .catch(() => showToast(lang === "zh" ? "保存失败" : "Failed to save", "error"));
  };

  const toggleRuleSelect = (name: string) => {
    setSelectedRules(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleBatchEdit = async () => {
    const mult = parseFloat(batchMultValue) || 1.0;
    const promises = Array.from(selectedRules).map(name => {
      const rule = rules.find(r => r.model_name === name);
      return fetch('/api/dashboard/multiplier', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_name: name, multiplier: mult, enabled: rule?.enabled ?? true, description: rule?.description }),
      });
    });
    await Promise.all(promises);
    setShowBatchDialog(false);
    setSelectedRules(new Set());
    fetchData();
    showToast(lang === "zh" ? "批量更新成功" : "Batch update successful", "success");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="h-48 animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t.title}</h1>

      {/* Time-based multiplier settings */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t.timeBased}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.timeDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!timeSettings.enabled}
                onChange={e => setTimeSettings(s => ({ ...s, enabled: e.target.checked ? 1 : 0 }))}
                className="rounded"
              />
              {t.enableTime}
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t.dayStart}</label>
              <input
                type="time"
                value={timeSettings.day_start}
                onChange={e => setTimeSettings(s => ({ ...s, day_start: e.target.value }))}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t.dayEnd}</label>
              <input
                type="time"
                value={timeSettings.day_end}
                onChange={e => setTimeSettings(s => ({ ...s, day_end: e.target.value }))}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t.dayRate}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={timeSettings.day_rate}
                onChange={e => setTimeSettings(s => ({ ...s, day_rate: parseFloat(e.target.value) || 1.0 }))}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t.nightRate}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={timeSettings.night_rate}
                onChange={e => setTimeSettings(s => ({ ...s, night_rate: parseFloat(e.target.value) || 0.5 }))}
                className="w-full px-3 py-2 bg-muted rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t.timezone}</label>
              <select
                value={timeSettings.timezone}
                onChange={e => setTimeSettings(s => ({ ...s, timezone: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSaveTimeSettings}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Save className="h-4 w-4" />
            {t.save}
          </button>
        </CardContent>
      </Card>

      {/* Regular multiplier rules */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            {t.regular}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.regularDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new rule form */}
          <div className="flex flex-wrap items-end gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground block mb-1">{t.model}</label>
              <input
                value={newModel}
                onChange={e => setNewModel(e.target.value)}
                placeholder="gpt-4o"
                className="w-full px-3 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="w-24">
              <label className="text-xs text-muted-foreground block mb-1">{t.multiplier}</label>
              <input
                value={newMultiplier}
                onChange={e => setNewMultiplier(e.target.value)}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-muted-foreground block mb-1">{t.description}</label>
              <input
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder={lang === "zh" ? "可选" : "Optional"}
                className="w-full px-3 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddRule}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t.add}
            </button>
          </div>

          {/* Rules table */}
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">{t.noRules}</div>
          ) : (
            <>
              {selectedRules.size > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">{t.selected.replace("{count}", String(selectedRules.size))}</span>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowBatchDialog(true)}>{t.batchEdit}</Button>
                </div>
              )}
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-2 w-8">
                      <input type="checkbox" checked={selectedRules.size === rules.length && rules.length > 0}
                        onChange={() => {
                          if (selectedRules.size === rules.length) setSelectedRules(new Set());
                          else setSelectedRules(new Set(rules.map(r => r.model_name)));
                        }} className="rounded" />
                    </th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">{t.model}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.multiplier}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.effectiveInput}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t.effectiveOutput}</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">{t.description}</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">{t.enabled}</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium">{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-2 px-2">
                        <input type="checkbox" checked={selectedRules.has(rule.model_name)}
                          onChange={() => toggleRuleSelect(rule.model_name)} className="rounded" />
                      </td>
                      <td className="py-2 px-3 font-mono text-xs">{rule.model_name}</td>
                      <td className="py-2 px-3 text-right font-mono">{rule.multiplier}x</td>
                      <td className="py-2 px-3 text-right font-mono text-xs">
                        {rule.input_rate != null ? `$${(rule.input_rate * rule.multiplier).toFixed(4)}/1K` : "-"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-xs">
                        {rule.output_rate != null ? `$${(rule.output_rate * rule.multiplier).toFixed(4)}/1K` : "-"}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground hidden md:table-cell">{rule.description || "-"}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`text-xs px-2 py-0.5 rounded-full ${rule.enabled ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}
                        >
                          {rule.enabled ? (lang === "zh" ? "是" : "Yes") : (lang === "zh" ? "否" : "No")}
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleDeleteRule(rule.model_name)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                          aria-label={lang === "zh" ? "删除" : "Delete"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{lang === "zh" ? "删除倍率规则" : "Delete Multiplier Rule"}</DialogTitle>
            <DialogDescription>
              {lang === "zh" ? `确定要删除 "${deleteTarget}" 的倍率规则吗？` : `Delete multiplier rule for "${deleteTarget}"?`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>{lang === "zh" ? "取消" : "Cancel"}</Button>
            <Button onClick={confirmDeleteRule} className="bg-red-600 text-white hover:bg-red-700">{lang === "zh" ? "确认删除" : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Edit Dialog */}
      <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.batchEditTitle}</DialogTitle>
            <DialogDescription>{t.batchEditDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t.newMultiplier}</label>
              <input type="number" step="0.01" min="0.01" max="100" value={batchMultValue}
                onChange={e => setBatchMultValue(e.target.value)}
                className="w-full px-3 py-2 bg-background rounded-lg text-sm border border-border/50 focus:border-primary focus:outline-none" />
            </div>
            <p className="text-xs text-muted-foreground">{t.selected.replace("{count}", String(selectedRules.size))}</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowBatchDialog(false)}>{t.cancel}</Button>
            <Button onClick={handleBatchEdit}>{t.apply}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
