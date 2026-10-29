"use client";

import { useState, useMemo } from "react";
import { StudyPlanDayCard, type StudyPlanDayItem } from "./study-plan-day-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CalendarX } from "lucide-react";
import {
  kitService,
  type StudyScheduleDay,
  type StudyScheduleTopic,
  type KitRequirement,
} from "@/services/kit.service";
import { useKitStore } from "@/hooks/use-kit-store";

export function getDayDateLabel(
  dayNumber: number,
  baseDate?: string | Date,
): string {
  if (dayNumber === 1) return "Today";
  if (dayNumber === 2) return "Tomorrow";

  const targetDate = new Date(baseDate || Date.now());
  targetDate.setDate(targetDate.getDate() + (dayNumber - 1));

  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function findQuestionId(
  topics: StudyScheduleTopic[] = [],
  requirements: KitRequirement[] = [],
): string | undefined {
  for (const t of topics) {
    if (t.requirement?.questions?.[0]?.id) {
      return t.requirement.questions[0].id;
    }
    const matchedReq = requirements.find(
      (r) =>
        r.id === t.requirementId ||
        r.topic?.toLowerCase().trim() === t.topic?.toLowerCase().trim(),
    );
    if (matchedReq?.questions?.[0]?.id) {
      return matchedReq.questions[0].id;
    }
  }

  return requirements.find((r) => r.questions?.[0]?.id)?.questions?.[0]?.id;
}

function mapDayToItem(
  day: StudyScheduleDay,
  prevDay: StudyScheduleDay | undefined,
  unlockedDays: Record<number, boolean>,
  createdAt?: string | Date,
  requirements?: KitRequirement[],
): StudyPlanDayItem {
  const topics = day.topics || [];
  const hasTopics = topics.length > 0;

  const topicNames = hasTopics
    ? topics.map((t) => t.topic).filter(Boolean).join(" & ")
    : "";

  const qCount = hasTopics
    ? topics.reduce(
        (sum, t) => sum + (t.requirement?.questions?.length || 5),
        0,
      )
    : 0;

  const fcCount = hasTopics ? Math.max(4, Math.round(qCount * 1.1)) : 0;
  const isCompleted = hasTopics && topics.every((t) => t.completed);

  const prevCompleted = Boolean(
    prevDay?.topics?.length && prevDay.topics.every((t) => t.completed),
  );

  const isUnlocked =
    isCompleted ||
    Boolean(unlockedDays[day.dayNumber]) ||
    day.dayNumber === 1 ||
    prevCompleted;

  const status: "ACTIVE" | "LOCKED" | "COMPLETED" = isCompleted
    ? "COMPLETED"
    : isUnlocked
      ? "ACTIVE"
      : "LOCKED";

  const estMinutes = hasTopics
    ? topics.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0)
    : 0;

  return {
    id: day.id,
    dayNumber: day.dayNumber,
    dateLabel: getDayDateLabel(day.dayNumber, createdAt),
    topicTitle: topicNames,
    questionsCount: qCount,
    flashcardsCount: fcCount,
    status,
    isEmpty: !hasTopics,
    questionId: findQuestionId(topics, requirements),
    estimatedMinutes: estMinutes,
  };
}

interface StudyPlanListProps {
  kitId: string;
  days?: StudyScheduleDay[];
  createdAt?: string | Date;
  requirements?: KitRequirement[];
}

export function StudyPlanList({
  kitId,
  days = [],
  createdAt,
  requirements = [],
}: StudyPlanListProps) {
  const [unlockedDays, setUnlockedDays] = useState<Record<number, boolean>>({
    1: true,
  });
  const [previewDay, setPreviewDay] = useState<StudyPlanDayItem | null>(null);

  const planItems = useMemo(() => {
    return days.map((day, idx) =>
      mapDayToItem(day, days[idx - 1], unlockedDays, createdAt, requirements),
    );
  }, [days, unlockedDays, createdAt, requirements]);

  // Empty state fallback when no study plan days are available
  if (!days || days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 mb-3.5">
          <CalendarX className="size-6 sm:size-7" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-white">
          No Study Plan Available
        </h3>
        <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-sm leading-relaxed">
          There are no scheduled study days generated for this kit yet.
        </p>
      </div>
    );
  }

  const handleUnlockDay = (dayNumber: number) => {
    const item = planItems.find((p) => p.dayNumber === dayNumber);
    if (item && !item.isEmpty) {
      setPreviewDay(item);
    }
  };

  const confirmUnlock = () => {
    if (previewDay) {
      setUnlockedDays((prev) => ({ ...prev, [previewDay.dayNumber]: true }));
      setPreviewDay(null);
    }
  };

  const handleToggleComplete = async (dayNumber: number) => {
    const currentItem = planItems.find((p) => p.dayNumber === dayNumber);
    if (!currentItem || currentItem.isEmpty) return;

    const willBeCompleted = currentItem.status !== "COMPLETED";

    // Optimistically unlock next day
    if (willBeCompleted) {
      setUnlockedDays((prev) => ({
        ...prev,
        [dayNumber]: true,
        [dayNumber + 1]: true,
      }));
    }

    try {
      const res = await kitService.toggleDayCompletion(
        kitId,
        dayNumber,
        willBeCompleted,
      );

      if (res.success && res.data) {
        useKitStore.getState().updateKit({
          progress: res.data.progress,
          studySchedule: res.data.studySchedule,
          studyPlan: res.data.studySchedule,
        });
      }
    } catch (err) {
      console.error("Failed to update day completion:", err);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3.5 sm:gap-4 w-full">
        {planItems.map((item) => (
          <StudyPlanDayCard
            key={item.dayNumber}
            item={item}
            kitId={kitId}
            onUnlockDay={handleUnlockDay}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      {/* Unlock / Day Preview Modal */}
      <Dialog
        open={Boolean(previewDay)}
        onOpenChange={(open) => !open && setPreviewDay(null)}
      >
        <DialogContent className="sm:max-w-md bg-[#131515] border-white/10 text-white rounded-2xl">
          <DialogHeader>
            <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 mb-3">
              <Lock className="size-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Day {previewDay?.dayNumber}: {previewDay?.topicTitle}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm mt-1">
              Scheduled for {previewDay?.dateLabel}. This module includes{" "}
              {previewDay?.questionsCount} practice questions and{" "}
              {previewDay?.flashcardsCount} flashcards.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex sm:justify-between items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPreviewDay(null)}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={confirmUnlock}
              className="bg-white hover:bg-white/90 text-black font-semibold rounded-xl flex items-center gap-1.5"
            >
              <Unlock className="size-4" />
              <span>Unlock Day</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
