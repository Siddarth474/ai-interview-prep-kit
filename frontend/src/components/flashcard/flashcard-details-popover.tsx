"use client";

import React from "react";
import {
  Info,
  BarChart2,
  Clock,
  CheckCircle2,
  RefreshCw,
  CircleDashed,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import type { FlashcardStatus } from "@/services/flashcard.service";
import { cn } from "@/lib/utils";

interface FlashcardDetailsPopoverProps {
  status?: FlashcardStatus | null;
  reviewCount?: number;
  lastReviewedAt?: string | Date | null;
}

function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return "Never";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Never";

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status?: FlashcardStatus | null) {
  switch (status) {
    case "MASTERED":
      return {
        label: "Mastered",
        icon: CheckCircle2,
        className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        iconClassName: "text-emerald-400",
      };
    case "IN_PROGRESS":
      return {
        label: "In Progress",
        icon: RefreshCw,
        className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        iconClassName: "text-amber-400",
      };
    case "NOT_STARTED":
    default:
      return {
        label: "Not Started",
        icon: CircleDashed,
        className: "bg-white/5 text-white/60 border-white/10",
        iconClassName: "text-white/40",
      };
  }
}

export function FlashcardDetailsPopover({
  status = "NOT_STARTED",
  reviewCount = 0,
  lastReviewedAt = null,
}: FlashcardDetailsPopoverProps) {
  const badge = getStatusBadge(status);
  const StatusIcon = badge.icon;
  const formattedDate = formatRelativeTime(lastReviewedAt);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className="shrink-0"
    >
      <Popover>
        <PopoverTrigger type="button" aria-label="View flashcard details">
          <Info className="size-3.5" />
        </PopoverTrigger>

        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="w-64 sm:w-72 p-4 text-xs select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-semibold text-white tracking-tight text-xs sm:text-sm">
              Flashcard Details
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                badge.className,
              )}
            >
              <StatusIcon className={cn("size-3", badge.iconClassName)} />
              {badge.label}
            </span>
          </div>

          {/* Details Rows */}
          <div className="pt-3 space-y-2.5">
            {/* Review Count */}
            <div className="flex items-center justify-between text-white/80">
              <span className="flex items-center gap-2 text-white/50">
                <BarChart2 className="size-3.5 text-white/40" />
                Review Count
              </span>
              <span className="font-medium text-white tabular-nums">
                {reviewCount} {reviewCount === 1 ? "time" : "times"}
              </span>
            </div>

            {/* Last Reviewed At */}
            <div className="flex items-center justify-between text-white/80">
              <span className="flex items-center gap-2 text-white/50">
                <Clock className="size-3.5 text-white/40" />
                Last Reviewed
              </span>
              <span className="font-medium text-white tabular-nums text-right">
                {formattedDate}
              </span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
