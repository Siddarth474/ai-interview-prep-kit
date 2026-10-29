"use client";

import React from "react";
import { Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuestion } from "@/hooks/use-question";
import { useKitStore } from "@/hooks/use-kit-store";
import type { KitData, KitRequirement, KitQuestion } from "@/services/kit.service";

interface DeleteQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitId: string;
  questionId?: string;
  onSuccess?: () => void;
}

export function DeleteQuestionDialog({
  open,
  onOpenChange,
  kitId,
  questionId,
  onSuccess,
}: DeleteQuestionDialogProps) {
  const { deleteQuestion, isLoading, error, setError } = useQuestion();
  const { kit, updateKit } = useKitStore();

  const handleConfirmDelete = async () => {
    if (!questionId) {
      setError("Question ID is missing");
      return;
    }

    try {
      await deleteQuestion(kitId, questionId);

      // Optimistically update kit store by removing the deleted question
      if (kit) {
        const updatePayload: Partial<KitData> = {};
        let totalCount = kit.questionsCount ? kit.questionsCount - 1 : 0;

        if (Array.isArray(kit.requirements)) {
          updatePayload.requirements = kit.requirements.map((r: KitRequirement) => {
            const nextQuestions = Array.isArray(r.questions)
              ? r.questions.filter((q: KitQuestion) => q.id !== questionId)
              : r.questions;
            return { ...r, questions: nextQuestions };
          });
          totalCount = (updatePayload.requirements || []).reduce(
            (acc: number, r: KitRequirement) => acc + (r.questions?.length || 0),
            0
          );
        }

        if (Array.isArray(kit.questions)) {
          updatePayload.questions = kit.questions.filter((q: KitQuestion) => q.id !== questionId);
        }

        updateKit({
          ...updatePayload,
          questionsCount: Math.max(0, totalCount),
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error is handled by useQuestion
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl bg-[#0e1111] border border-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <Trash2 className="size-3.5" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-tight text-white">
              Delete Question
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-white/50">
            Are you sure you want to delete this question? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 animate-in fade-in duration-200"
          >
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-9 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isLoading}
            className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
