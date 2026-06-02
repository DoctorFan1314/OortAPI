"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useI18n } from "@/contexts/i18n-context";
import { useToast } from "@/contexts/toast-context";
import { canPerformAction } from "@/lib/utils";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: "spam" | "abuse" | "copyright" | "other", description: string) => void;
}

export function ReportModal({ open, onClose, onSubmit }: ReportModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [reportReason, setReportReason] = useState<"spam" | "abuse" | "copyright" | "other">("spam");
  const [reportDesc, setReportDesc] = useState("");

  function handleSubmit() {
    if (!canPerformAction("report", 5000)) { toast(t.rateLimit.tooFast, "error"); return; }
    onSubmit(reportReason, reportDesc);
    setReportReason("spam");
    setReportDesc("");
  }

  function handleOpenChange(v: boolean) {
    if (!v) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton closeLabel={t.common.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.common.report}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">{t.common.reportReason}</p>

        <div className="space-y-2 mb-4">
          {(["spam", "abuse", "copyright", "other"] as const).map((reason) => (
            <label key={reason} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="report-reason"
                value={reason}
                checked={reportReason === reason}
                onChange={() => setReportReason(reason)}
                className="accent-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {t.common[`report${reason.charAt(0).toUpperCase() + reason.slice(1)}` as keyof typeof t.common]}
              </span>
            </label>
          ))}
        </div>

        <textarea
          value={reportDesc}
          onChange={(e) => setReportDesc(e.target.value)}
          placeholder={t.common.reportReason}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none min-h-[60px] mb-4"
        />

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleSubmit}>
            {t.common.report}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
