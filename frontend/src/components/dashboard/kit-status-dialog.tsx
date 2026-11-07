"use client";

import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RotateCcw,
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
import {
  getSavedKitProgress,
  saveKitProgress,
  clearKitProgress,
} from "@/lib/kit-progress";

interface KitStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitId: string | null;
  initialKit?: KitData | null;
  onKitReady?: (kit: KitData) => void;
  onKitUpdated?: (kit: KitData) => void;
  onOpenKit?: (kitId: string) => void;
}

export function KitStatusDialog({
  open,
  onOpenChange,
  kitId,
  initialKit,
  onKitReady,
  onKitUpdated,
  onOpenKit,
}: KitStatusDialogProps) {
  const [kit, setKit] = useState<KitData | null>(initialKit || null);
  const [status, setStatus] = useState<string>(initialKit?.status || "CREATED");
  const [progress, setProgress] = useState<number>(() =>
    getSavedKitProgress(kitId, initialKit?.status),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prevKitId, setPrevKitId] = useState<string | null>(kitId);
  const [prevOpen, setPrevOpen] = useState(open);
  const [isRetrying, setIsRetrying] = useState(false);
  const [pollTrigger, setPollTrigger] = useState(0);

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onKitReadyRef = useRef(onKitReady);
  const onKitUpdatedRef = useRef(onKitUpdated);

  useEffect(() => {
    onKitReadyRef.current = onKitReady;
    onKitUpdatedRef.current = onKitUpdated;
  });

  // Adjust state when dialog is opened or kitId changes (official React pattern)
  if (kitId !== prevKitId || open !== prevOpen) {
    setPrevKitId(kitId);
    setPrevOpen(open);
    if (open) {
      const currentStat = initialKit?.status || "CREATED";
      setStatus(currentStat);
      setProgress(getSavedKitProgress(kitId, currentStat));
      setErrorMessage(null);
      setKit(initialKit || null);
    }
  }

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const handleRetry = async () => {
    if (!kitId || isRetrying) return;
    setIsRetrying(true);
    setErrorMessage(null);

    try {
      const res = await kitService.retryKit(kitId);
      if (res.success && res.data) {
        const updated = res.data;
        clearKitProgress(kitId);
        setKit(updated);
        setStatus("CREATED");
        setProgress(25);
        saveKitProgress(kitId, 25);
        onKitUpdatedRef.current?.(updated);
        setPollTrigger((prev) => prev + 1);
      } else {
        setErrorMessage(
          res.message || "Failed to restart generation. Please try again.",
        );
      }
    } catch (err: unknown) {
      console.error("Failed to retry kit:", err);
      setErrorMessage(
        "AI service was temporarily at capacity. Please try again in a moment.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (!open || !kitId) {
      stopPolling();
      return;
    }

    let isSubscribed = true;

    const pollStatus = async () => {
      try {
        const res = await kitService.getKit(kitId);
        if (!isSubscribed) return;

        if (res.success && res.data) {
          const fetched = res.data;
          setKit(fetched);
          const currentStatus = fetched.status || "CREATED";
          setStatus(currentStatus);

          const isReady = currentStatus === "COMPLETED";

          if (isReady) {
            setProgress(100);
            clearKitProgress(kitId);
            stopPolling();
            onKitReadyRef.current?.(fetched);
          } else if (currentStatus === "FAILED") {
            stopPolling();
            setErrorMessage(
              "AI service was temporarily at capacity. Spikes in demand are temporary.",
            );
          } else if (currentStatus === "GENERATING") {
            setProgress((prev) => {
              const next = Math.min(96, Math.max(75, prev < 75 ? 75 : prev + 3));
              saveKitProgress(kitId, next);
              return next;
            });
          } else if (currentStatus === "RESEARCHING") {
            setProgress((prev) => {
              const next = Math.min(70, Math.max(50, prev < 50 ? 50 : prev + 3));
              saveKitProgress(kitId, next);
              return next;
            });
          } else {
            // Keep steady progression if still CREATED
            setProgress((prev) => {
              const next = Math.min(45, Math.max(25, prev + 3));
              saveKitProgress(kitId, next);
              return next;
            });
          }
        }
      } catch (err: unknown) {
        console.error("Failed to poll kit status:", err);
      }
    };

    // First fetch immediately
    pollStatus();

    // Poll every 2.5 seconds
    pollTimerRef.current = setInterval(pollStatus, 2500);

    return () => {
      isSubscribed = false;
      stopPolling();
    };
  }, [open, kitId, pollTrigger]);

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

  const companyName =
    kit?.company || kit?.companyName || "Company Preparation";
  const roleName = kit?.roleTitle || kit?.role || "Interview Kit";

  const handleAction = () => {
    if (isCompleted && kitId && onOpenKit) {
      onOpenChange(false);
      onOpenKit(kitId);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#131515] border-white/10 text-white rounded-2xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="size-6 text-emerald-400" />
              ) : isFailed ? (
                <AlertCircle className="size-6 text-red-400" />
              ) : (
                <Sparkles className="size-6 text-amber-400 animate-pulse" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                {companyName}
              </DialogTitle>
              <DialogDescription className="text-xs text-white/50">
                {roleName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Status Body */}
        <div className="space-y-5 my-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/70 font-medium">Progress</span>
              <span className="text-white font-semibold">{progress}%</span>
            </div>

            {/* Custom Smooth Progress Bar */}
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-700 ease-out rounded-full ${
                  isFailed
                    ? "bg-red-500"
                    : isCompleted
                      ? "bg-emerald-500"
                      : "bg-white"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Action / Description Pill */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 flex items-start gap-3">
            {!isCompleted && !isFailed && (
              <Loader2 className="size-4.5 text-white/70 animate-spin mt-0.5 shrink-0" />
            )}
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
              {getStatusText()}
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
          {isCompleted ? (
            <Button
              onClick={handleAction}
              className="w-full bg-white hover:bg-white/90 text-black font-semibold rounded-xl text-xs sm:text-sm h-10 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Open Interview Kit</span>
              <ArrowRight className="size-4" />
            </Button>
          ) : isFailed ? (
            <div className="flex flex-col-reverse sm:flex-row items-center gap-2 w-full">
              <Button
                variant="outline"
                disabled={isRetrying}
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-1/3 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs sm:text-sm h-10 cursor-pointer"
              >
                Close
              </Button>
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full sm:w-2/3 bg-white hover:bg-white/90 text-black font-semibold rounded-xl text-xs sm:text-sm h-10 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRetrying ? (
                  <Loader2 className="size-4 animate-spin text-black" />
                ) : (
                  <RotateCcw className="size-4 text-black" />
                )}
                <span>{isRetrying ? "Restarting..." : "Retry Generation"}</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-xl text-xs sm:text-sm h-10 transition-colors cursor-pointer"
            >
              Continue in background
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
