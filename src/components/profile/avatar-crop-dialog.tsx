"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Cropper = lazy(() => import("react-easy-crop"));
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
}

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function getCroppedImg(imageSrc: string, pixelCrop: PixelCrop): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        size,
        size,
      );
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageSrc;
  });
}

export function AvatarCropDialog({ open, onOpenChange, imageSrc, onCropComplete }: AvatarCropDialogProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropCompleteCallback = useCallback((_croppedArea: unknown, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const dataUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Compress if over 200KB
      const approxBytes = Math.round((dataUrl.length * 3) / 4);
      const MAX_SIZE = 200 * 1024; // 200KB
      if (approxBytes > MAX_SIZE) {
        // Re-render at smaller size with lower quality
        const smallCanvas = document.createElement("canvas");
        smallCanvas.width = 128;
        smallCanvas.height = 128;
        const smallCtx = smallCanvas.getContext("2d");
        if (smallCtx) {
          const blob = await fetch(dataUrl).then(r => r.blob());
          const lower = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            const objUrl = URL.createObjectURL(blob);
            img.onload = () => { smallCtx.drawImage(img, 0, 0, 128, 128); URL.revokeObjectURL(objUrl); resolve(smallCanvas.toDataURL("image/jpeg", 0.6)); };
            img.onerror = () => { URL.revokeObjectURL(objUrl); reject(new Error("Failed to compress image")); };
            img.src = objUrl;
          });
          onCropComplete(lower);
        } else {
          onCropComplete(dataUrl);
        }
      } else {
        onCropComplete(dataUrl);
      }
      onOpenChange(false);
    } catch (err) {
      console.error("Avatar crop failed:", err);
      toast("Avatar crop failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.avatar.changeAvatar}</DialogTitle>
        </DialogHeader>

        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/20">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">...</div>}>
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteCallback}
            />
          </Suspense>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{t.avatar.zoomOut}</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{t.avatar.zoomIn}</span>
        </div>

        <p className="text-xs text-muted-foreground text-center">{t.avatar.dragToAdjust}</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground hover:bg-secondary">
            {t.avatar.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {loading ? "..." : t.avatar.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
