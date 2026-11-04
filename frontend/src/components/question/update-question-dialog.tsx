"use client";

import React, { useState } from "react";
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
import { useQuestion } from "@/hooks/use-question";
import { useKitStore } from "@/hooks/use-kit-store";
import type { KitData, KitRequirement, KitQuestion } from "@/services/kit.service";
import { notify } from "@/lib/notification";

export interface QuestionData {
  id?: string;
  position?: number;
  question: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" | string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | string;
  answer?: string;
  guidance?: string | null;
  requirementId?: string | null;
  isEdited?: boolean;
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

type CategoryType = "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC";
type DifficultyType = "EASY" | "MEDIUM" | "HARD";

function parseCategory(category?: string): CategoryType {
  const upper = (category || "").toUpperCase();
  if (upper === "BEHAVIORAL") return "BEHAVIORAL";
  if (upper === "ROLE_SPECIFIC" || upper === "ROLE") return "ROLE_SPECIFIC";
  return "TECHNICAL";
}

function parseDifficulty(difficulty?: string): DifficultyType {
  const upper = (difficulty || "").toUpperCase();
  if (upper === "EASY") return "EASY";
  if (upper === "HARD") return "HARD";
  return "MEDIUM";
}

const CATEGORIES: { label: string; value: CategoryType }[] = [
  { label: "Technical", value: "TECHNICAL" },
  { label: "Behavioral", value: "BEHAVIORAL" },
  { label: "Role Specific", value: "ROLE_SPECIFIC" },
];

const DIFFICULTIES: {
  label: string;
  value: DifficultyType;
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

  const [formData, setFormData] = useState<{
    question: string;
    answer: string;
    category: CategoryType;
    difficulty: DifficultyType;
  }>(() => ({
    question: question?.question || "",
    answer: question?.answer || "",
    category: parseCategory(question?.category),
    difficulty: parseDifficulty(question?.difficulty),
  }));

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevQuestionId, setPrevQuestionId] = useState(question?.id);

  if (open !== prevOpen || question?.id !== prevQuestionId) {
    setPrevOpen(open);
    setPrevQuestionId(question?.id);
    if (open && question) {
      setFormData({
        question: question.question || "",
        answer: question.answer || "",
        category: parseCategory(question.category),
        difficulty: parseDifficulty(question.difficulty),
      });
      setError(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim()) {
      const msg = "Question text cannot be empty";
      setError(msg);
      notify.error(msg);
      return;
    }

    const questionId = question.id;
    if (!questionId) {
      const msg = "Question ID is missing";
      setError(msg);
      notify.error(msg);
      return;
    }

    try {
      const updated = await updateQuestion(kitId, questionId, {
        question: formData.question.trim(),
        answer: formData.answer.trim() || undefined,
        category: formData.category,
        difficulty: formData.difficulty,
      });

      // Update in kit store for instant optimistic UI update
      if (kit) {
        const updatePayload: Partial<KitData> = {};

        if (Array.isArray(kit.requirements)) {
          updatePayload.requirements = kit.requirements.map((r: KitRequirement) => ({
            ...r,
            questions: Array.isArray(r.questions)
              ? r.questions.map((q: KitQuestion) =>
                  q.id === questionId
                    ? { ...q, ...updated, ...formData, isEdited: true }
                    : q
                )
              : r.questions,
          }));
        }

        if (Array.isArray(kit.questions)) {
          updatePayload.questions = kit.questions.map((q: KitQuestion) =>
            q.id === questionId
              ? { ...q, ...updated, ...formData, isEdited: true }
              : q
          );
        }

        updateKit(updatePayload);
      }

      notify.success("Question updated successfully");
      onSuccess?.({ ...question, ...updated, ...formData, isEdited: true });
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update question";
      notify.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg max-h-[85vh] sm:max-h-[88vh] min-h-95 p-0 flex flex-col rounded-2xl bg-[#0e1111] border border-white/10 text-white shadow-2xl backdrop-blur-xl overflow-hidden">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-white/10 shrink-0 space-y-1.5 text-left">
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
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
                    if (val) setFormData((prev) => ({ ...prev, category: val as CategoryType }));
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
                    if (val) setFormData((prev) => ({ ...prev, difficulty: val as DifficultyType }));
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
                Answer
              </Label>
              <Textarea
                id="guidance-text"
                value={formData.answer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, answer: e.target.value }))
                }
                placeholder="Key criteria, points to look for in candidate's response..."
                disabled={isLoading}
                rows={4}
                className="resize-none bg-white/4 border-white/10 text-white placeholder:text-white/30 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 transition-all text-sm leading-relaxed"
              />
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 pt-3 border-t border-white/10 bg-[#0e1111] shrink-0">
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
