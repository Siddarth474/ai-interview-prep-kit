"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKitStore } from "@/hooks/use-kit-store";
import { FlashcardGrid } from "@/components/flashcard";
import KitLoading from "../loading";
import { cn } from "@/lib/utils";

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

  const flashcards = Array.isArray(kit?.flashcards) ? kit.flashcards : [];

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
            Quickly revise important concepts with AI-generated flashcards.
          </p>
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

      {/* Flashcards Grid (no filters) */}
      <FlashcardGrid cards={flashcards} kitId={id} />
    </div>
  );
}

