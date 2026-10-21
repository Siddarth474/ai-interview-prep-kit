"use client";

import { useState } from "react";
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
import { Lock, Unlock, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { StudyScheduleDay } from "@/services/kit.service";

export const SAMPLE_STUDY_PLAN_DAYS: StudyPlanDayItem[] = [
  {
    dayNumber: 1,
    dateLabel: "Today",
    topicTitle: "JavaScript Fundamentals",
    questionsCount: 6,
    flashcardsCount: 8,
    status: "ACTIVE",
  },
  {
    dayNumber: 2,
    dateLabel: "Tomorrow",
    topicTitle: "React & Next.js",
    questionsCount: 8,
    flashcardsCount: 6,
    status: "LOCKED",
  },
  {
    dayNumber: 3,
    dateLabel: "Apr 25",
    topicTitle: "REST APIs",
    questionsCount: 6,
    flashcardsCount: 8,
    status: "LOCKED",
  },
  {
    dayNumber: 4,
    dateLabel: "Apr 26",
    topicTitle: "Databases (PostgreSQL & MongoDB)",
    questionsCount: 8,
    flashcardsCount: 6,
    status: "LOCKED",
  },
];

export function getDayDateLabel(
  dayNumber: number,
  baseDate?: string | Date,
): string {
  if (dayNumber === 1) return "Today";
  if (dayNumber === 2) return "Tomorrow";

  const start = baseDate ? new Date(baseDate) : new Date();
  const targetDate = new Date(start);
  targetDate.setDate(targetDate.getDate() + (dayNumber - 1));

  return targetDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

interface StudyPlanListProps {
  kitId: string;
  days?: StudyScheduleDay[];
  createdAt?: string | Date;
}

export function StudyPlanList({ kitId, days, createdAt }: StudyPlanListProps) {
  // State for unlocked days (default Day 1 is unlocked)
  const [unlockedDays, setUnlockedDays] = useState<Record<number, boolean>>({
    1: true,
  });

  // State for modal preview when clicking a locked day
  const [previewDay, setPreviewDay] = useState<StudyPlanDayItem | null>(null);

  // Map backend days or use sample fallback
  const planItems: StudyPlanDayItem[] =
    days && days.length > 0
      ? days.map((d) => {
          const hasTopics = Boolean(d.topics && d.topics.length > 0);
          const topicNames = hasTopics
            ? d.topics.map((t) => t.topic).join(" & ")
            : "";

          const qCount = hasTopics
            ? d.topics.reduce(
                (acc, t) => acc + (t.requirement?.questions?.length || 5),
                0,
              )
            : 0;

          const fcCount = hasTopics ? Math.max(4, Math.round(qCount * 1.1)) : 0;

          const isDayUnlocked = unlockedDays[d.dayNumber] ?? d.dayNumber === 1;

          return {
            id: d.id,
            dayNumber: d.dayNumber,
            dateLabel: getDayDateLabel(d.dayNumber, createdAt),
            topicTitle: topicNames,
            questionsCount: qCount,
            flashcardsCount: fcCount,
            status: isDayUnlocked ? "ACTIVE" : "LOCKED",
            isEmpty: !hasTopics,
          };
        })
      : SAMPLE_STUDY_PLAN_DAYS.map((sample) => ({
          ...sample,
          status:
            (unlockedDays[sample.dayNumber] ?? sample.dayNumber === 1)
              ? "ACTIVE"
              : "LOCKED",
          isEmpty: false,
        }));

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

  return (
    <>
      <div className="flex flex-col gap-3.5 sm:gap-4 w-full">
        {planItems.map((item) => (
          <StudyPlanDayCard
            key={item.dayNumber}
            item={item}
            kitId={kitId}
            onUnlockDay={handleUnlockDay}
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
            <div className="flex items-center gap-2">
              <Button
                onClick={confirmUnlock}
                className="bg-white hover:bg-white/90 text-black font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Unlock className="size-4" />
                <span>Unlock Day</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
