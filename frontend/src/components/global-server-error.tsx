"use client";

import { useState } from "react";
import { WifiOff, ServerCrash, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerError } from "@/hooks/use-server-error";
import { cn } from "@/lib/utils";

export function GlobalServerError() {
  const { hasError, message, statusCode, clearServerError } = useServerError();
  const [isRetrying, setIsRetrying] = useState(false);

  if (!hasError) return null;

  const handleRetry = () => {
    setIsRetrying(true);
    clearServerError();
    window.location.reload();
  };

  const is500 = Boolean(statusCode && statusCode >= 500);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute size-96 rounded-full bg-amber-500/10 blur-3xl -top-12" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="server-error-title"
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-3xl p-6 sm:p-8",
          "border border-white/10 bg-linear-to-b from-[#161a1a] via-[#101313] to-[#0a0c0c]",
          "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/10 text-center",
          "animate-in zoom-in-95 duration-200"
        )}
      >
        {/* Top ambient highlight line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/40 to-transparent" />

        {/* Dismiss button at top-right */}
        <button
          type="button"
          onClick={clearServerError}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss error modal"
        >
          <X className="size-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_-3px_rgba(245,158,11,0.25)]">
          {is500 ? (
            <ServerCrash className="size-7" />
          ) : (
            <WifiOff className="size-7" />
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2 mb-6">
          <h2
            id="server-error-title"
            className="text-lg sm:text-xl font-bold tracking-tight text-white"
          >
            {is500 ? "Server Error (500)" : "Unable to connect to server"}
          </h2>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-sm mx-auto">
            {message ||
              "The backend server is currently unreachable. Please verify your connection or check that the backend is running."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full sm:w-auto h-10 px-5 rounded-xl bg-white text-zinc-950 font-semibold hover:bg-zinc-100 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw
              className={cn("size-3.5", isRetrying && "animate-spin")}
            />
            <span>{isRetrying ? "Retrying..." : "Retry Connection"}</span>
          </Button>

          <Button
            onClick={clearServerError}
            variant="outline"
            className="w-full sm:w-auto h-10 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
