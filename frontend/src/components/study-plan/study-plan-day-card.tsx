"use client";

import Link from "next/link";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StudyPlanDayItem {
  id?: string;
  dayNumber: number;
  dateLabel?: string;
  topicTitle: string;
  questionsCount: number;
  flashcardsCount: number;
  status: "ACTIVE" | "LOCKED" | "COMPLETED";
  isEmpty?: boolean;
  questionId?: string;
  requirementId?: string;
  estimatedMinutes?: number | null;
}

interface StudyPlanDayCardProps {
  item: StudyPlanDayItem;
  kitId: string;
  onUnlockDay?: (dayNumber: number) => void;
  onToggleComplete?: (dayNumber: number) => void;
}

export function StudyPlanDayCard({
  item,
  kitId,
  onUnlockDay,
  onToggleComplete,
}: StudyPlanDayCardProps) {
  const isUnlocked = item.status === "ACTIVE";
  const isCompleted = item.status === "COMPLETED";
  const isEmpty =
    item.isEmpty || (!item.topicTitle && item.questionsCount === 0);
  const targetUrl = item.questionId
    ? `/dashboard/kit/${kitId}/questions/${item.questionId}`
    : `/dashboard/kit/${kitId}/questions`;

  return (
    <Card
      className={cn(
        "rounded-2xl border border-white/10 bg-[#131515] p-5 sm:p-6 transition-all duration-200 select-none",
        isEmpty
          ? "opacity-50 border-white/5 bg-[#101212]"
          : isCompleted
            ? "border-emerald-500/20 bg-[#101514] hover:border-emerald-500/30"
            : isUnlocked
              ? "hover:border-white/20 hover:bg-[#161818] shadow-sm"
              : "opacity-90 hover:border-white/15 hover:bg-[#151717]",
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Day & Topics */}
        <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
          {/* Day & Date Column */}
          <div className="w-20 sm:w-24 shrink-0">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Day {item.dayNumber}
            </h3>
            <p className="text-xs sm:text-sm text-white/50 font-normal mt-0.5">
              {item.dateLabel ||
                (item.dayNumber === 1
                  ? "Today"
                  : item.dayNumber === 2
                    ? "Tomorrow"
                    : `Day ${item.dayNumber}`)}
            </p>
          </div>

          {/* Vertical Separator */}
          <div className="w-px h-10 bg-white/10 shrink-0" />

          {/* Topic Title & Subtitle */}
          <div className="min-w-0 flex-1">
            {isEmpty ? (
              <p className="text-sm text-white/30 italic">Empty</p>
            ) : (
              <>
                <h4 className="text-base sm:text-[17px] font-semibold text-white tracking-tight truncate sm:whitespace-normal">
                  {item.topicTitle}
                </h4>
                <p className="text-xs sm:text-sm text-white mt-1 flex flex-wrap items-center gap-1.5">
                  <span>{item.questionsCount} questions</span>
                  <span>•</span>
                  <span>{item.flashcardsCount} flashcards</span>
                  {item.estimatedMinutes ? (
                    <>
                      <span>•</span>
                      <span>⏱️ ~{item.estimatedMinutes}m</span>
                    </>
                  ) : null}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Action Button / Lock / Completed / Empty */}
        <div className="flex items-center self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
          {isEmpty ? (
            <div className="text-xs text-white/20 font-mono pr-2">—</div>
          ) : isCompleted ? (
            <button
              type="button"
              onClick={() => onToggleComplete?.(item.dayNumber)}
              className="h-10 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer group"
              title="Day completed! Click to mark incomplete"
            >
              <CheckCircle2 className="size-4 group-hover:scale-110 transition-transform" />
              <span>Completed</span>
            </button>
          ) : isUnlocked ? (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onToggleComplete?.(item.dayNumber)}
                className="h-10 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 text-white/70 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all cursor-pointer group"
                title="Mark Day as Completed"
              >
                <CheckCircle2 className="size-4 shrink-0 text-white/40 group-hover:text-emerald-400 transition-colors" />
                <span className="hidden sm:inline">Mark Done</span>
              </button>
              <Link
                href={targetUrl}
                className="bg-white hover:bg-white/90 text-black font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm h-10 shrink-0 shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5 group self-start sm:self-auto"
              >
                <span>Start</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onUnlockDay?.(item.dayNumber)}
              className="size-10 sm:size-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors cursor-pointer shrink-0"
              title={`Click to preview or unlock Day ${item.dayNumber}`}
              aria-label={`Locked Day ${item.dayNumber}`}
            >
              <Lock className="size-4 sm:size-4.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
