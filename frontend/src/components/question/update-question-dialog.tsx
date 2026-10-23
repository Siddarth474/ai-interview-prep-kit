"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuestion } from "@/hooks/use-question";
import { useKitStore } from "@/hooks/use-kit-store";

export interface QuestionData {
  id?: string;
  position?: number;
  question: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" | string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | string;
  guidance?: string | null;
  requirementId?: string | null;
  requirement?: {
    id?: string;
    topic?: string;
    text?: string;
    category?: string;
  } | null;
}

interface UpdateQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitId: string;
  question: QuestionData;
  onSuccess?: (updated: QuestionData) => void;
}

const CATEGORIES: { label: string; value: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" }[] = [
  { label: "Technical", value: "TECHNICAL" },
  { label: "Behavioral", value: "BEHAVIORAL" },
  { label: "Role Specific", value: "ROLE_SPECIFIC" },
];

const DIFFICULTIES: {
  label: string;
  value: "EASY" | "MEDIUM" | "HARD";
  dotClass: string;
}[] = [
  { label: "Easy", value: "EASY", dotClass: "bg-emerald-400" },
  { label: "Medium", value: "MEDIUM", dotClass: "bg-yellow-400" },
  { label: "Hard", value: "HARD", dotClass: "bg-rose-400" },
];

export function UpdateQuestionDialog({
  open,
  onOpenChange,
  kitId,
  question,
  onSuccess,
}: UpdateQuestionDialogProps) {
  const { updateQuestion, isLoading, error, setError } = useQuestion();
  const { kit, updateKit } = useKitStore();

  const [formData, setFormData] = useState({
    question: "",
    guidance: "",
    category: "TECHNICAL" as "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC",
    difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
  });

  useEffect(() => {
    if (open && question) {
      setFormData({
        question: question.question || "",
        guidance: question.guidance || "",
        category: (question.category as any) || "TECHNICAL",
        difficulty: (question.difficulty as any) || "MEDIUM",
      });
      setError(null);
    }
  }, [open, question, setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      setError("Question text cannot be empty");
      return;
    }

    const questionId = question.id;
    if (!questionId) {
      setError("Question ID is missing");
      return;
    }

    try {
      const updated = await updateQuestion(kitId, questionId, {
        question: formData.question.trim(),
        guidance: formData.guidance.trim() || undefined,
        category: formData.category,
        difficulty: formData.difficulty,
      });

      // Update in kit store for instant optimistic UI update
      if (kit) {
        const updatePayload: any = {};

        if (Array.isArray(kit.requirements)) {
          updatePayload.requirements = kit.requirements.map((r: any) => ({
            ...r,
            questions: Array.isArray(r.questions)
              ? r.questions.map((q: any) =>
                  q.id === questionId ? { ...q, ...updated, ...formData } : q
                )
              : r.questions,
          }));
        }

        if (Array.isArray(kit.questions)) {
          updatePayload.questions = kit.questions.map((q: any) =>
            q.id === questionId ? { ...q, ...updated, ...formData } : q
          );
        }

        updateKit(updatePayload);
      }

      onSuccess?.({ ...question, ...updated, ...formData });
      onOpenChange(false);
    } catch {
      // Error is already captured by useQuestion
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl bg-[#0e1111] border border-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-white">
              <Pencil className="size-3.5" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              Edit Question
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-white/50">
            Modify the question text, category, difficulty, or additional guidance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 animate-in fade-in duration-200"
            >
              {error}
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question-text" className="text-xs font-medium text-white/80">
              Question Text <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="question-text"
              value={formData.question}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, question: e.target.value }))
              }
              placeholder="e.g. How do you handle idempotency in RESTful APIs?"
              disabled={isLoading}
              rows={3}
              required
              className="resize-none bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm leading-relaxed"
            />
          </div>

          {/* Category & Difficulty Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-2">
              <Label htmlFor="category-select" className="text-xs font-medium text-white/80">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(val) => {
                  if (val) setFormData((prev) => ({ ...prev, category: val as any }));
                }}
              >
                <SelectTrigger
                  id="category-select"
                  className="w-full h-10 bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm cursor-pointer"
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#121616] border border-white/10 text-white shadow-2xl p-1 z-50">
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer rounded-lg text-sm py-2 px-2.5"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Select */}
            <div className="space-y-2">
              <Label htmlFor="difficulty-select" className="text-xs font-medium text-white/80">
                Difficulty
              </Label>
              <Select
                value={formData.difficulty}
                onValueChange={(val) => {
                  if (val) setFormData((prev) => ({ ...prev, difficulty: val as any }));
                }}
              >
                <SelectTrigger
                  id="difficulty-select"
                  className="w-full h-10 bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm cursor-pointer"
                >
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-[#121616] border border-white/10 text-white shadow-2xl p-1 z-50">
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem
                      key={diff.value}
                      value={diff.value}
                      className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer rounded-lg text-sm py-2 px-2.5 flex items-center gap-2"
                    >
                      <span>{diff.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Guidance / Key Criteria */}
          <div className="space-y-2">
            <Label htmlFor="guidance-text" className="text-xs font-medium text-white/80">
              Additional Guidance
            </Label>
            <Textarea
              id="guidance-text"
              value={formData.guidance}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, guidance: e.target.value }))
              }
              placeholder="Key criteria, points to look for in candidate's response..."
              disabled={isLoading}
              rows={4}
              className="resize-none bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm leading-relaxed"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="h-10 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.question.trim()}
              className="h-10 rounded-xl bg-white text-black hover:bg-white/90 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
