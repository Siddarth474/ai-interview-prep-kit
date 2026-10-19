"use client";

import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { kitService, type KitData } from "@/services/kit.service";

interface KitStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitId: string | null;
  initialKit?: KitData | null;
  onKitReady?: (kit: KitData) => void;
  onOpenKit?: (kitId: string) => void;
}

export function KitStatusDialog({
  open,
  onOpenChange,
  kitId,
  initialKit,
  onKitReady,
  onOpenKit,
}: KitStatusDialogProps) {
  const [kit, setKit] = useState<KitData | null>(initialKit || null);
  const [status, setStatus] = useState<string>("CREATED");
  const [progress, setProgress] = useState<number>(25);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!open || !kitId) {
      stopPolling();
      return;
    }

    // Initialize state
    setStatus(initialKit?.status || "CREATED");
    setProgress(
      initialKit?.status === "COMPLETED"
        ? 100
        : initialKit?.status === "GENERATING"
          ? 75
          : initialKit?.status === "RESEARCHING"
            ? 50
            : 25,
    );
    setErrorMessage(null);
    if (initialKit) {
      setKit(initialKit);
    }

    const pollStatus = async () => {
      try {
        const res = await kitService.getKit(kitId);
        if (res.success && res.data) {
          const fetched = res.data as KitData;
          setKit(fetched);
          const currentStatus = fetched.status || "CREATED";
          setStatus(currentStatus);

          const isReady =
            currentStatus === "COMPLETED";

          if (isReady) {
            setProgress(100);
            stopPolling();
            onKitReady?.(fetched);
          } else if (currentStatus === "FAILED") {
            stopPolling();
            setErrorMessage(
              "Interview kit generation failed. Please try again.",
            );
          } else if (currentStatus === "GENERATING") {
            setProgress((prev) => Math.max(prev, 75));
          } else if (currentStatus === "RESEARCHING") {
            setProgress((prev) => Math.max(prev, 50));
          } else {
            // Keep steady progression if still CREATED
            setProgress((prev) => (prev < 45 ? prev + 5 : prev));
          }
        }
      } catch (err: any) {
        console.error("Failed to poll kit status:", err);
      }
    };

    // First fetch immediately
    pollStatus();

    // Poll every 2.5 seconds
    pollTimerRef.current = setInterval(pollStatus, 2500);

    return () => {
      stopPolling();
    };
  }, [open, kitId]);

  const isCompleted = status === "COMPLETED" || progress === 100;
  const isFailed = status === "FAILED" || !!errorMessage;

  const getStatusText = () => {
    if (isFailed) return errorMessage || "Generation encountered an issue";
    if (isCompleted) return "Your interview kit is ready!";
    if (status === "GENERATING" || progress >= 75)
      return "Generating questions, flashcards & preparation plan...";
    if (status === "RESEARCHING" || progress >= 50)
      return "Researching company details & interview requirements...";
    return "Analyzing job description and preparing timeline...";
  };

  const getTargetTitle = () => {
    if (kit?.companyName) return kit.companyName;
    if (kit?.companyUrl) {
      try {
        const host = new URL(kit.companyUrl).hostname.replace(/^www\./, "");
        const name = host.split(".")[0];
        return name.charAt(0).toUpperCase() + name.slice(1);
      } catch {
        // fallback
      }
    }
    return "Interview Kit";
  };

  const handleOpenClick = () => {
    if (kitId) {
      onOpenKit?.(kitId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl bg-[#0e1111] border border-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-8 items-center justify-center rounded-xl transition-colors ${
                isCompleted
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : isFailed
                    ? "bg-red-500/15 text-red-400 border border-red-500/25"
                    : "bg-white/10 text-white border border-white/10"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="size-4" />
              ) : isFailed ? (
                <AlertCircle className="size-4" />
              ) : (
                <Sparkles className="size-4 animate-pulse" />
              )}
            </div>

            <div>
              <DialogTitle className="text-lg font-semibold tracking-tight text-white">
                {isCompleted
                  ? "Kit Ready"
                  : isFailed
                    ? "Generation Failed"
                    : "Preparing Kit"}
              </DialogTitle>
              <DialogDescription className="text-xs text-white/50">
                {getTargetTitle()}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status Message and Progress Bar */}
        <div className="space-y-3.5 py-1">
          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium ${
                isCompleted
                  ? "text-emerald-400"
                  : isFailed
                    ? "text-red-400"
                    : "text-white/80"
              }`}
            >
              {getStatusText()}
            </span>
            <span className="text-white/50 tabular-nums font-semibold">
              {progress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isCompleted
                  ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                  : isFailed
                    ? "bg-red-400"
                    : "bg-white"
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          {/* Polling sub-status indicator */}
          {!isCompleted && !isFailed && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-white/40">
              <Loader2 className="size-3 animate-spin text-white/60" />
              <span>Polling status in background...</span>
            </div>
          )}
        </div>

        {/* Dialog Actions */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-white/8">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9.5 border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white text-xs sm:text-sm cursor-pointer transition-all"
          >
            {isCompleted ? "Close" : "Continue in Background"}
          </Button>

          {isCompleted && (
            <Button
              type="button"
              onClick={handleOpenClick}
              className="h-9.5 bg-white text-[#090b0b]! hover:bg-white/90 font-semibold px-4 text-xs sm:text-sm flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
            >
              <span>Open Kit</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
