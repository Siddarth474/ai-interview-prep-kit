"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useKitStore } from "@/hooks/use-kit-store";
import { FlashcardGrid } from "@/components/flashcard";
import KitLoading from "../loading";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/services/flashcard.service";

export default function KitFlashcardsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchKit(id);
    }
  }, [id, fetchKit]);

  const handleRegenerate = async () => {
    if (!id || isRegenerating) return;
    try {
      setIsRegenerating(true);
      await fetchKit(id, true);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (loading && !kit) {
    return <KitLoading />;
  }

  const flashcards: Flashcard[] = Array.isArray(kit?.flashcards)
    ? (kit.flashcards as Flashcard[])
    : [];
  const totalCards = flashcards.length;
  const masteredCount = flashcards.filter(
    (card: Flashcard) => card?.progress?.status === "MASTERED",
  ).length;
  const progressPercentage =
    totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Flashcards
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              Quickly revise important concepts with AI-generated flashcards.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="h-10 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-2 shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCw
            className={cn("size-3.5", isRegenerating && "animate-spin")}
          />
          <span>Regenerate</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="rounded-2xl border border-white/10 bg-white/3 p-4 sm:p-5 backdrop-blur-sm shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="size-4" />
            </div>
            <span className="text-sm font-semibold text-white">
              Mastery Progress
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium tabular-nums">
              {masteredCount} of {totalCards} Mastered
            </span>
          </div>

          <span className="text-xs sm:text-sm text-white/60 tabular-nums font-medium self-end sm:self-auto">
            {progressPercentage}% Complete
          </span>
        </div>

        <Progress
          value={progressPercentage}
          className="w-full gap-0 [&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-white/10 [&_[data-slot=progress-indicator]]:bg-emerald-400 [&_[data-slot=progress-indicator]]:rounded-full"
        />
      </div>

      {/* Flashcards Grid (no filters) */}
      <FlashcardGrid cards={flashcards} kitId={id} />
    </div>
  );
}
