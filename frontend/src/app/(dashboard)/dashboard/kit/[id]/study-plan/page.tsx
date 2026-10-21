"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
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
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {daysCount} Day Study Plan
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
            A personalized study plan to help you cover all topics effectively.
          </p>
        </div>
      </div>

      {/* Study Plan List (no List/Calendar View buttons as requested) */}
      <StudyPlanList
        kitId={id}
        days={scheduleDays}
        createdAt={kit?.createdAt}
      />
    </div>
  );
}
