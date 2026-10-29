"use client";

import { useState } from "react";
import { RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFlashcard } from "@/hooks/use-flashcard";
import { useKitStore } from "@/hooks/use-kit-store";
import { FlashcardDetailsPopover } from "./flashcard-details-popover";
import type {
  Flashcard,
  FlashcardStatus,
  FlashcardProgress,
} from "@/services/flashcard.service";

export interface FlashcardItem {
  id?: string;
  front: string;
  back: string;
  isBookmarked?: boolean;
}

interface FlashcardCardProps {
  card: Flashcard | FlashcardItem;
  index: number;
  kitId?: string;
}

export function FlashcardCard({ card, index, kitId }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const initialProgress =
    "progress" in card && card.progress ? card.progress : null;
  const [progress, setProgress] = useState<FlashcardProgress | null>(
    initialProgress
  );
  const [reviewedStatus, setReviewedStatus] = useState<FlashcardStatus | null>(
    initialProgress?.status ?? null
  );
  const [reviewingAction, setReviewingAction] =
    useState<FlashcardStatus | null>(null);
  const { reviewFlashcard, isReviewing } = useFlashcard();
  const number = String(index + 1).padStart(2, "0");

  const handleReview = async (
    e: React.MouseEvent,
    status: FlashcardStatus,
    autoFlip: boolean = false
  ) => {
    e.stopPropagation(); 
    if (autoFlip) {
      setIsFlipped(true); 
    }
    setReviewedStatus(status);

    // Optimistically update store so top progress bar updates immediately
    if (card.id) {
      const currentKit = useKitStore.getState().kit;
      if (currentKit && Array.isArray(currentKit.flashcards)) {
        const updatedFlashcards = currentKit.flashcards.map((f: Flashcard) =>
          f.id === card.id
            ? {
                ...f,
                progress: f.progress
                  ? { ...f.progress, status }
                  : {
                      id: f.id,
                      flashcardId: f.id,
                      userId: "",
                      status,
                      reviewCount: 1,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
              }
            : f
        );
        useKitStore.getState().updateKit({ flashcards: updatedFlashcards });
      }
    }

    if (!kitId || !card.id || isReviewing) return;

    setReviewingAction(status);
    try {
      const updatedProgress = await reviewFlashcard(kitId, card.id, status);
      if (updatedProgress?.status) {
        setProgress(updatedProgress);
        setReviewedStatus(updatedProgress.status);
        if (card.id) {
          const currentKit = useKitStore.getState().kit;
          if (currentKit && Array.isArray(currentKit.flashcards)) {
            const updatedFlashcards = currentKit.flashcards.map((f: Flashcard) =>
              f.id === card.id
                ? {
                    ...f,
                    progress: updatedProgress,
                  }
                : f
            );
            useKitStore.getState().updateKit({ flashcards: updatedFlashcards });
          }
        }
      }
    } finally {
      setReviewingAction(null);
    }
  };

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className="group relative h-60 sm:h-72 perspective-distant cursor-pointer select-none"
    >
      <div
        className={cn(
          "relative w-full h-full transform-3d transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1",
          isFlipped && "transform-[rotateY(180deg)]"
        )}
      >
        {/* Front Face */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden overflow-hidden gap-0",
            "rounded-3xl border border-white/10 p-5 sm:p-7 flex flex-col justify-between",
            "bg-linear-to-br from-[#1a1d1d] via-[#131515] to-[#0d0f0f]",
            "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]",
            "transition-[border-color,box-shadow] duration-300",
            "group-hover:border-white/20 group-hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.9)]"
          )}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-white/4 blur-3xl" />
          {/* Large faded index */}
          <span className="pointer-events-none absolute -bottom-6 -right-2 text-[120px] sm:text-[140px] font-bold leading-none text-white/3 tabular-nums">
            {number}
          </span>

          {/* Top metadata */}
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
              <span className="size-1.5 rounded-full bg-white/40" />
              Question {index + 1}
            </span>

            {/* Flashcard Details Popover at Top-Right */}
            <FlashcardDetailsPopover
              status={reviewedStatus ?? progress?.status ?? "NOT_STARTED"}
              reviewCount={progress?.reviewCount ?? 0}
              lastReviewedAt={progress?.lastReviewedAt}
            />
          </div>

          {/* Question text */}
          <div className="relative my-auto py-2 overflow-y-auto flex-1 min-h-0">
            <p className="text-white font-semibold text-base sm:text-xl leading-snug tracking-tight">
              {card.front}
            </p>
          </div>

          {/* Bottom Bar: Action buttons on Front + Flip prompt */}
          <div className="relative flex items-center justify-between gap-2 pt-2 z-10">
            <div className="flex items-center gap-2">
              {/* Still Learn -> Blackish button */}
              <button
                type="button"
                onClick={(e) => handleReview(e, "IN_PROGRESS", true)}
                disabled={isReviewing}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5",
                  "text-[11px] sm:text-xs font-medium transition-all duration-200",
                  "bg-[#0e1011] text-zinc-300 hover:text-white hover:bg-black",
                  "border border-white/15 hover:border-white/30",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                  "hover:scale-105 active:scale-95 cursor-pointer shrink-0",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  reviewedStatus === "IN_PROGRESS" &&
                    "border-amber-400/40 text-amber-300 bg-black/90 ring-1 ring-amber-400/30",
                )}
              >
                {isReviewing && reviewingAction === "IN_PROGRESS" ? (
                  <Loader2 className="size-3 animate-spin text-zinc-400" />
                ) : (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      reviewedStatus === "IN_PROGRESS"
                        ? "bg-amber-400"
                        : "bg-zinc-500",
                    )}
                  />
                )}
                Still Learn
              </button>

              {/* I Know -> White button */}
              <button
                type="button"
                onClick={(e) => handleReview(e, "MASTERED", false)}
                disabled={isReviewing}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5",
                  "text-[11px] sm:text-xs font-semibold transition-all duration-200",
                  "bg-white text-zinc-950 hover:bg-zinc-100",
                  "border border-white shadow-[0_2px_10px_rgba(255,255,255,0.15)]",
                  "hover:scale-105 active:scale-95 cursor-pointer shrink-0",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  reviewedStatus === "MASTERED" && "ring-2 ring-emerald-400/60",
                )}
              >
                {isReviewing && reviewingAction === "MASTERED" ? (
                  <Loader2 className="size-3 animate-spin text-zinc-950" />
                ) : (
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      reviewedStatus === "MASTERED"
                        ? "bg-emerald-600"
                        : "bg-zinc-400",
                    )}
                  />
                )}
                {reviewedStatus === "MASTERED" ? "✓ I Know" : "I Know"}
              </button>
            </div>

            {/* Flip prompt */}
            <div className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-white/70 transition-colors shrink-0">
              <span className="flex size-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
                <RotateCcw className="size-3 transition-transform duration-500 group-hover:-rotate-180" />
              </span>
              <span className="hidden sm:inline">Flip</span>
            </div>
          </div>
        </Card>

        {/* Back Face (Answer Face - NO ACTION BUTTONS) */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] overflow-hidden gap-0",
            "rounded-3xl border border-emerald-400/25 p-5 sm:p-7 flex flex-col justify-between",
            "bg-linear-to-br from-[#12201c] via-[#0f1715] to-[#0b1110]",
            "shadow-[0_8px_40px_-12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/10",
          )}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />

          {/* Top metadata */}
          <div className="relative flex items-center justify-between">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300"
            >
              <Sparkles className="size-3" />
              Answer
            </Badge>
            <span className="text-xs font-medium text-emerald-300/50 tabular-nums">
              {number}
            </span>
          </div>

          {/* Answer text */}
          <div className="relative my-auto py-2 overflow-y-auto flex-1 min-h-0">
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              {card.back}
            </p>
          </div>

          {/* Bottom Bar on Back Face: Status indicator + Flip back prompt only (NO BUTTONS) */}
          <div className="relative flex items-center justify-between gap-2 pt-2 z-10">
            {reviewedStatus ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  reviewedStatus === "MASTERED"
                    ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25"
                    : "bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/25",
                )}
              >
                {reviewedStatus === "MASTERED"
                  ? "✓ Mastered"
                  : "• Still Learning"}
              </span>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-1.5 text-xs text-emerald-300/60 group-hover:text-emerald-300 transition-colors shrink-0">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/20">
                <RotateCcw className="size-3 transition-transform duration-500 group-hover:rotate-180" />
              </span>
              <span>Flip back</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
