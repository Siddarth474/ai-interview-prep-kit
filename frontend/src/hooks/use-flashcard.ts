"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import {
  flashcardService,
  type FlashcardStatus,
  type FlashcardProgress,
} from "@/services/flashcard.service";

export function useFlashcard() {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reviewFlashcard = useCallback(
    async (
      kitId: string,
      flashcardId: string,
      status: FlashcardStatus
    ): Promise<FlashcardProgress | null> => {
      setIsReviewing(true);
      setError(null);
      try {
        const res = await flashcardService.reviewFlashcard(
          kitId,
          flashcardId,
          status
        );
        if (!res.success) {
          throw new Error(res.message || "Failed to review flashcard");
        }
        return res.data;
      } catch (err: unknown) {
        const message =
          (axios.isAxiosError(err) &&
            (err.response?.data as { message?: string } | undefined)?.message) ||
          (err instanceof Error ? err.message : null) ||
          "Failed to review flashcard";
        setError(message);
        return null;
      } finally {
        setIsReviewing(false);
      }
    },
    []
  );

  return { reviewFlashcard, isReviewing, error, setError };
}
