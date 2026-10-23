"use client";

import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/services/flashcard.service";

export interface FlashcardItem {
  id?: string;
  front: string;
  back: string;
  isBookmarked?: boolean;
}

interface FlashcardCardProps {
  card: Flashcard | FlashcardItem;
  index: number;
}

export function FlashcardCard({ card, index }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      onClick={() => setIsFlipped((prev) => !prev)}
      className="group relative h-60 sm:h-72 perspective-distant  cursor-pointer select-none"
    >
      <div
        className={cn(
          "relative w-full h-full transform-3d transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "group-hover:-translate-y-1",
          isFlipped && "transform-[rotateY(180deg)]",
        )}
      >
        {/* Front Face */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden overflow-hidden gap-0",
            "rounded-3xl border border-white/10 p-6 sm:p-7 flex flex-col",
            "bg-linear-to-br from-[#1a1d1d] via-[#131515] to-[#0d0f0f]",
            "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]",
            "transition-[border-color,box-shadow] duration-300",
            "group-hover:border-white/20 group-hover:shadow-[0_20px_45px_-15px_rgba(0,0,0,0.9)]",
          )}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-white/4 blur-3xl" />
          {/* Large faded index */}
          <span className="pointer-events-none absolute -bottom-6 -right-2 text-[120px] sm:text-[140px] font-bold leading-none text-white/3 tabular-nums">
            {number}
          </span>

          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
              <span className="size-1.5 rounded-full bg-white/40" />
              Question {index + 1}
            </span>
          </div>

          <div className="relative my-auto py-3 overflow-y-auto">
            <p className="text-white font-semibold text-lg sm:text-xl leading-snug tracking-tight">
              {card.front}
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-white/40 group-hover:text-white/70 transition-colors">
            <span className="flex size-6 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 group-hover:bg-white/10 transition-colors">
              <RotateCcw className="size-3 transition-transform duration-500 group-hover:-rotate-180" />
            </span>
            <span>Tap to reveal the answer</span>
          </div>
        </Card>

        {/* Back Face */}
        <Card
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden transform-[rotateY(180deg)] overflow-hidden gap-0",
            "rounded-3xl border border-emerald-400/25 p-6 sm:p-7 flex flex-col",
            "bg-linear-to-br from-[#12201c] via-[#0f1715] to-[#0b1110]",
            "shadow-[0_8px_40px_-12px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400/10",
          )}
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/60 to-transparent" />

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

          <div className="relative my-auto py-3 overflow-y-auto">
            <p className="text-white/90 text-sm sm:text-base leading-relaxed">
              {card.back}
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-emerald-300/60 group-hover:text-emerald-300 transition-colors">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/20">
              <RotateCcw className="size-3 transition-transform duration-500 group-hover:rotate-180" />
            </span>
            <span>Tap to flip back</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
