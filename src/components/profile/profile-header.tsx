"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { Calendar, Mail, User, Camera } from "lucide-react";
import Image from "next/image";
import { AvatarCropDialog } from "./avatar-crop-dialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ProfileHeader() {
  const { user, updateProfile } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);

  if (!user) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast(t.avatar.fileTooLarge, "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Reset so same file can be re-selected
    e.target.value = "";
  }

  function handleCropComplete(dataUrl: string) {
    updateProfile({ avatar: dataUrl });
    setCropImage(null);
  }

  return (
    <>
      <div className="glass-card p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-primary shrink-0 group cursor-pointer overflow-hidden"
            aria-label={t.avatar.changeAvatar}
          >
            {user.avatar ? (
              <Image src={user.avatar} alt={user.username} fill className="rounded-full object-cover" unoptimized />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-1">{user.username}</h1>
            {user.bio && <p className="text-sm text-muted-foreground mb-2">{user.bio}</p>}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{t.profile.joinedAt} {new Date(user.joinDate).toLocaleDateString("zh-CN")}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />{user.role === "admin" ? t.profile.adminRole : t.profile.userRole}</span>
            </div>
          </div>
        </div>
      </div>

      {cropImage && (
        <AvatarCropDialog
          open={!!cropImage}
          onOpenChange={(open) => { if (!open) setCropImage(null); }}
          imageSrc={cropImage}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
