"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { useI18n } from "@/contexts/i18n-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { Sun, Moon, Monitor, Download, Trash2, AlertTriangle } from "lucide-react";

export function SettingsTab() {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { t } = useI18n();

  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  function handleSaveProfile() {
    if (!username.trim()) {
      toast(t.settings.usernameRequired, "error");
      return;
    }
    updateProfile({ username: username.trim(), bio: bio.trim() });
    toast(t.settings.profileUpdated, "success");
  }

  async function handleChangePassword() {
    setPwError("");
    if (!currentPw || !newPw) {
      setPwError(t.settings.fillAllFields);
      return;
    }
    if (newPw.length < 8) {
      setPwError(t.settings.passwordMinLength);
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(t.settings.passwordMismatch);
      return;
    }
    const ok = await changePassword(currentPw, newPw);
    if (!ok) {
      setPwError(t.settings.wrongPassword);
      return;
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast(t.settings.passwordChanged, "success");
  }

  function handleExportData() {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("ai-skills-hub-")) {
        try { data[key] = JSON.parse(localStorage.getItem(key) || ""); } catch { data[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-skills-hub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(t.settings.dataExported, "success");
  }

  function handleClearData() {
    const keysToKeep: string[] = [STORAGE_KEYS.users, STORAGE_KEYS.session, STORAGE_KEYS.theme];
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("ai-skills-hub-") && !keysToKeep.includes(key)) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
    toast(t.settings.dataCleared, "success");
  }

  function handleDeleteAccount() {
    if (!user) return;
    // Remove user from users list
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      const users = raw ? JSON.parse(raw) : [];
      const updated = users.filter((u: { email: string }) => u.email !== user.email);
      localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(updated));
    } catch { /* ignore */ }
    // Clear user-scoped data
    const userEmail = user.email;
    const userKeys = [
      STORAGE_KEYS.likes(userEmail),
      STORAGE_KEYS.bookmarks(userEmail),
      STORAGE_KEYS.submissions(userEmail),
      STORAGE_KEYS.comments(userEmail),
      STORAGE_KEYS.activity(userEmail),
    ];
    userKeys.forEach((k) => localStorage.removeItem(k));
    logout();
    toast(t.settings.accountDeleted, "info");
  }

  return (
    <div className="space-y-8">
      {/* Edit Profile */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.settings.editProfile}</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-foreground mb-1.5 block">{t.settings.username}</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} className="bg-secondary border-border text-foreground" />
          </div>
          <div>
            <label className="text-sm text-foreground mb-1.5 block">{t.settings.bio}</label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder={t.settings.bioPlaceholder} className="bg-secondary border-border text-foreground placeholder:text-muted-foreground/50" />
          </div>
          <Button onClick={handleSaveProfile} className="bg-primary text-primary-foreground hover:bg-primary/90">{t.settings.saveProfile}</Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.settings.changePassword}</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm text-foreground mb-1.5 block">{t.settings.currentPassword}</label>
            <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="bg-secondary border-border text-foreground" />
          </div>
          <div>
            <label className="text-sm text-foreground mb-1.5 block">{t.settings.newPassword}</label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder={t.settings.passwordPlaceholder} className="bg-secondary border-border text-foreground" />
          </div>
          <div>
            <label className="text-sm text-foreground mb-1.5 block">{t.settings.confirmPassword}</label>
            <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="bg-secondary border-border text-foreground" />
          </div>
          {pwError && <p className="text-sm text-red-400">{pwError}</p>}
          <Button onClick={handleChangePassword} variant="outline" className="border-border text-foreground hover:bg-secondary">{t.settings.changePassword}</Button>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.settings.themePreference}</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { key: "light" as const, label: t.settings.light, icon: Sun },
            { key: "dark" as const, label: t.settings.dark, icon: Moon },
            { key: "system" as const, label: t.settings.system, icon: Monitor },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                  theme === opt.key
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.settings.dataManage}</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <Button onClick={handleExportData} variant="outline" className="border-border text-foreground hover:bg-secondary">
            <Download className="h-4 w-4 mr-2" />{t.settings.exportData}
          </Button>
          <Button onClick={handleClearData} variant="outline" className="border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
            <Trash2 className="h-4 w-4 mr-2" />{t.settings.clearData}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{t.settings.exportDesc}</p>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-destructive/30">
        <h3 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />{t.settings.dangerZone}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{t.settings.dangerDesc}</p>
        {!showDeleteConfirm ? (
          <Button variant="outline" onClick={() => setShowDeleteConfirm(true)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
            {t.settings.deleteAccount}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button onClick={handleDeleteAccount} className="bg-destructive text-white hover:bg-destructive/90">{t.settings.confirmDelete}</Button>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="text-muted-foreground">{t.common.cancel}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
