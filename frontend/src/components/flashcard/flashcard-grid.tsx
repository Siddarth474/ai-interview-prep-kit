"use client";

import { Layers } from "lucide-react";
import { FlashcardCard, type FlashcardItem } from "./flashcard-card";
import type { Flashcard } from "@/services/flashcard.service";

interface FlashcardGridProps {
  cards?: (Flashcard | FlashcardItem)[];
  kitId?: string;
}

export function FlashcardGrid({
  cards,
  kitId,
}: FlashcardGridProps) {
  if (!cards || cards.length === 0) {
    return (
      <div className="w-full py-16 px-6 flex flex-col items-center justify-center gap-3 text-center rounded-2xl border border-white/10 bg-white/2 backdrop-blur-sm">
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/40 mb-1">
          <Layers className="size-6 text-white/40" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-base sm:text-lg font-semibold text-white">
            No flashcards created
          </h3>
          <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
            There are no flashcards available for this interview kit yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
      {cards.map((card, idx) => (
        <FlashcardCard
          key={card.id || idx}
          card={card}
          index={idx}
          kitId={kitId}
        />
      ))}
    </div>
  );
}
