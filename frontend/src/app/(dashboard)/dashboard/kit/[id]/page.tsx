"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { kitService, type KitData } from "@/services/kit.service";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCw } from "lucide-react";
import { KitStatsCards } from "./components/kit-stats-cards";
import { KitRequirementsBreakdown } from "./components/kit-requirements-breakdown";
import KitLoading from "./loading";

export default function KitDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const [kit, setKit] = useState<KitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadKit() {
      try {
        setLoading(true);
        const res = await kitService.getKit(id);
        if (res.success) {
          setKit(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch kit:", err);
      } finally {
        setLoading(false);
      }
    }
    loadKit();
  }, [id]);

  if (loading) {
    return <KitLoading />;
  }

  // Derive tech stack or subtitle
  const subtitle =
    (kit?.jobDescription && kit.jobDescription.length > 90
      ? kit.jobDescription.slice(0, 90) + "..."
      : kit?.jobDescription) ||
    "React, Next.js, Node.js, TypeScript, PostgreSQL";

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header: Role Title with Back button + Regenerate Kit button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
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
              {kit?.role || "Full Stack Developer"}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="h-10 px-4 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-2 shrink-0 transition-colors cursor-pointer"
        >
          <RotateCw className="size-3.5" />
          <span>Regenerate Kit</span>
        </Button>
      </div>

      {/* 4 Stats Cards */}
      <KitStatsCards kit={kit} />

      {/* Requirements Breakdown Card */}
      <KitRequirementsBreakdown kit={kit} />
    </div>
  );
}

