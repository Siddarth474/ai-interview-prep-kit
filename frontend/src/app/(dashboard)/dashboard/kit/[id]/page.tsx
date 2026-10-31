"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { KitStatsCards } from "@/components/overview/kit-stats-cards";
import { KitRequirementsBreakdown } from "@/components/overview/kit-requirements-breakdown";
import { KitCompanyBrief } from "@/components/overview/kit-company-brief";
import KitLoading from "./loading";
import { useKitStore } from "@/hooks/use-kit-store";

export default function KitOverviewPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  useEffect(() => {
    if (id) fetchKit(id);
  }, [id, fetchKit]);

  if (loading && !kit) return <KitLoading />;

  const subtitle =
    (kit?.jobDescription && kit.jobDescription.length > 90
      ? kit.jobDescription.slice(0, 90) + "..."
      : kit?.jobDescription) ||
    "React, Next.js, Node.js, TypeScript, PostgreSQL";

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
              {kit?.roleBreakdown?.roleTitle || "Full Stack Developer"}
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

      <KitStatsCards kit={kit} />

      <KitRequirementsBreakdown kit={kit} />

      <KitCompanyBrief kit={kit} />
    </div>
  );
}
