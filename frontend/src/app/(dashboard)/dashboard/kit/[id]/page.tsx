"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, RotateCcw, Loader2 } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { KitStatsCards } from "@/components/overview/kit-stats-cards";
import { KitRequirementsBreakdown } from "@/components/overview/kit-requirements-breakdown";
import { KitCompanyBrief } from "@/components/overview/kit-company-brief";
import KitLoading from "./loading";
import { useKitStore } from "@/hooks/use-kit-store";
import { kitService } from "@/services/kit.service";
import { notify } from "@/lib/notification";

export default function KitOverviewPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (id) fetchKit(id);
  }, [id, fetchKit]);

  // Background polling if kit is currently generating
  useEffect(() => {
    if (!id) return;
    const isInProgress =
      kit?.status && kit.status !== "COMPLETED" && kit.status !== "FAILED";

    if (!isInProgress) return;

    const interval = setInterval(() => {
      fetchKit(id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [id, kit?.status, fetchKit]);

  const handleRetry = async () => {
    if (!id || isRetrying) return;
    setIsRetrying(true);
    try {
      const res = await kitService.retryKit(id);
      if (res.success) {
        notify.success("Kit generation restarted successfully");
        await fetchKit(id, true);
      } else {
        notify.error(res.message || "Failed to restart generation");
      }
    } catch (err: unknown) {
      console.error("Failed to retry kit:", err);
      notify.error("Failed to restart generation. Please try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading && !kit) return <KitLoading />;

  const subtitle =
    (kit?.jobDescription && kit.jobDescription.length > 90
      ? kit.jobDescription.slice(0, 90) + "..."
      : kit?.jobDescription) ||
    "Nothing to show";

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
          <Link
            href="/dashboard"
            className="size-9 sm:size-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0 mt-0.5 sm:mt-0"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="size-4 sm:size-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {kit?.roleBreakdown?.roleTitle || "NA"}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              {Array.isArray(kit?.roleBreakdown?.technologies) &&
              kit.roleBreakdown.technologies.length > 0
                ? kit.roleBreakdown.technologies.join(", ")
                : subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Failure Banner with Retry Action */}
      {kit?.status === "FAILED" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-200">
                AI Generation Encountered High Demand
              </p>
              <p className="text-xs text-red-300/80 mt-0.5">
                Upstream AI capacity spikes are temporary. Click retry to regenerate questions, flashcards, and schedule without re-entering details.
              </p>
            </div>
          </div>
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-white hover:bg-white/90 text-black font-semibold rounded-lg text-xs h-9 px-3.5 flex items-center gap-2 shrink-0 cursor-pointer self-start sm:self-auto"
          >
            {isRetrying ? (
              <Loader2 className="size-3.5 animate-spin text-black" />
            ) : (
              <RotateCcw className="size-3.5 text-black" />
            )}
            <span>{isRetrying ? "Restarting..." : "Retry Generation"}</span>
          </Button>
        </div>
      )}

      {/* In-Progress Notification Banner */}
      {kit?.status && kit.status !== "COMPLETED" && kit.status !== "FAILED" && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-white shadow-sm">
          <Loader2 className="size-5 text-amber-400 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-200">
              Kit Generation in Progress
            </p>
            <p className="text-xs text-amber-300/80 mt-0.5">
              We are researching company info, extracting requirements, and preparing interview questions...
            </p>
          </div>
        </div>
      )}

      <KitStatsCards kit={kit} />

      <KitRequirementsBreakdown kit={kit} />

      <KitCompanyBrief kit={kit} />
    </div>
  );
}
