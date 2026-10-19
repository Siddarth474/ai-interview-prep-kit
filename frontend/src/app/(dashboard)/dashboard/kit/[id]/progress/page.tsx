"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, TrendingUp, BarChart3 } from "lucide-react";
import { kitService, type KitData } from "@/services/kit.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKitStore } from "@/hooks/use-kit-store";
import KitLoading from "../loading";

export default function KitProgressPage() {
  const params = useParams();
    const id = (params?.id as string) || "";
    const { kit, loading, fetchKit } = useKitStore();
  
    useEffect(() => {
      if (id) fetchKit(id);
    }, [id, fetchKit]);
  
    if (loading && !kit) return <KitLoading />;

  const progress = kit?.progress ?? 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Link
            href={`/dashboard/kit/${id}`}
            className="size-9 sm:size-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0 mt-0.5 sm:mt-0"
            title="Back to Overview"
            aria-label="Back to Overview"
          >
            <ArrowLeft className="size-4 sm:size-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Preparation Progress
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              {kit?.role || "Full Stack Developer"} • Interview readiness metrics and performance tracking
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Placeholder Card */}
      <Card className="rounded-2xl border border-white/10 bg-[#111414] shadow-lg p-6 sm:p-8">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-base sm:text-lg font-semibold text-white flex items-center gap-2.5">
            <TrendingUp className="size-5 text-white/70" />
            <span>Readiness Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 mb-4">
              <BarChart3 className="size-6" />
            </div>
            <h3 className="text-base font-semibold text-white">Overall Readiness: {progress}%</h3>
            <p className="text-xs sm:text-sm text-white/50 max-w-md mt-1 mb-5">
              Comprehensive analytics on answer accuracy, flashcard retention, and curriculum completion.
            </p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <CheckCircle2 className="size-4 text-emerald-500/80" />
              <span>Real-time completion tracking enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
