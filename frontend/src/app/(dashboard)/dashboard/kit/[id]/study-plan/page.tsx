"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useKitStore } from "@/hooks/use-kit-store";
import { StudyPlanList } from "@/components/study-plan";
import KitLoading from "../loading";

export default function KitStudyPlanPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  useEffect(() => {
    if (id) {
      fetchKit(id);
    }
  }, [id, fetchKit]);

  if (loading && !kit) {
    return <KitLoading />;
  }

  const daysCount =
    kit?.studySchedule?.totalDays ??
    kit?.studySchedule?.days?.length ??
    kit?.studyPlan?.totalDays ??
    kit?.daysAvailable ??
    30;

  const scheduleDays =
    kit?.studySchedule?.days ?? kit?.studyPlan?.days ?? [];

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {daysCount} Day Study Plan
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              A personalized study plan to help you cover all topics effectively.
            </p>
          </div>
        </div>
      </div>

      {/* Study Plan List */}
      <StudyPlanList
        kitId={id}
        days={scheduleDays}
        createdAt={kit?.createdAt}
        requirements={kit?.requirements}
      />
    </div>
  );
}
