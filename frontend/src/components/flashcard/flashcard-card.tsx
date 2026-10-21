"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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

export function FlashcardCard({
  card,
  index,
}: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card
      onClick={() => setIsFlipped((prev) => !prev)}
      className={cn(
        "relative group min-h-40 sm:min-h-44 rounded-2xl border border-white/10 bg-[#131515] p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-white/20 hover:bg-[#161818] shadow-sm select-none",
        isFlipped && "bg-[#151818] border-emerald-500/30 ring-1 ring-emerald-500/20"
      )}
    >
      {/* Top Header: Badge if flipped & Bookmark button */}
      <div className="flex items-center justify-between w-full">
        <div>
          {isFlipped ? (
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-semibold px-2 py-0.5 rounded-full"
            >
              Answer
            </Badge>
          ) : (
            <div className="h-5" />
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="my-auto pt-2 pb-1">
        {!isFlipped ? (
          <p className="text-white font-medium text-base sm:text-[17px] leading-snug">
            {card.front}
          </p>
        ) : (
          <p className="text-white/80 text-sm sm:text-[15px] leading-relaxed">
            {card.back}
          </p>
        )}
      </div>

      {/* Flip action hint */}
      <div className="flex items-center justify-between pt-2 text-[11px] text-white/30 group-hover:text-white/50 transition-colors">
        <span className="flex items-center gap-1.5">
          <RotateCcw className="size-3" />
          {isFlipped ? "Click to flip back" : "Click to reveal answer"}
        </span>
      </div>
    </Card>
  );
}
