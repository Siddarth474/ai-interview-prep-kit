"use client";

import React from "react";
import { Loader2, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCreateKit } from "@/hooks/use-create-kit";

interface CreateKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (kit: any) => void;
}

export function CreateKitDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateKitDialogProps) {
  const {
    kitData,
    setKitData,
    isLoading,
    error,
    handleClose,
    handleSubmit,
  } = useCreateKit({
    onOpenChange,
    onSuccess,
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl bg-[#0e1111] border border-white/10 p-6 text-white shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white">
              <Sparkles className="size-3.5" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              Create Interview Kit
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-white/50">
            Enter the company URL, paste the job description, and specify your
            preparation timeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 animate-in fade-in duration-200"
            >
              {error}
            </div>
          )}

          {/* Company URL */}
          <div className="space-y-2">
            <Label
              htmlFor="companyUrl"
              className="text-xs font-medium text-white/80"
            >
              Company URL
            </Label>
            <Input
              id="companyUrl"
              type="url"
              placeholder="https://company.com/careers"
              value={kitData.companyUrl}
              onChange={(e) =>
                setKitData({ ...kitData, companyUrl: e.target.value })
              }
              disabled={isLoading}
              required
              className="h-10  bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm"
            />
          </div>

          {/* Job Description (JD) */}
          <div className="space-y-2">
            <Label
              htmlFor="jobDescription"
              className="text-xs font-medium text-white/80"
            >
              Job Description (JD)
            </Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description, role expectations, and tech stack requirements..."
              value={kitData.jobDescription}
              onChange={(e) =>
                setKitData({ ...kitData, jobDescription: e.target.value })
              }
              disabled={isLoading}
              required
              rows={5}
              className="min-h-30 max-h-52 overflow-y-auto bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm resize-none"
            />
          </div>

          {/* Days Available */}
          <div className="space-y-2">
            <Label
              htmlFor="daysAvailable"
              className="text-xs font-medium text-white/80"
            >
              Days Available
            </Label>
            <Input
              id="daysAvailable"
              type="number"
              min={1}
              max={90}
              placeholder="e.g. 14"
              value={kitData.daysAvailable}
              onChange={(e) =>
                setKitData({ ...kitData, daysAvailable: e.target.value })
              }
              disabled={isLoading}
              required
              className="h-10 bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm"
            />
          </div>

          {/* Actions */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-white/8">
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleClose(false)}
              className="h-10 border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white text-xs sm:text-sm cursor-pointer transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-10  bg-white text-[#090b0b]! hover:bg-white/90 font-semibold px-5 text-xs sm:text-sm shadow-sm cursor-pointer transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating Kit...
                </>
              ) : (
                "Generate Kit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
