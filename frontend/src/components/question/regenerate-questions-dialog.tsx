"use client";

import React, { useState, useEffect } from "react";
import { Loader2, RotateCw, Sparkles, Clock, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuestion } from "@/hooks/use-question";
import { useKitStore } from "@/hooks/use-kit-store";

export interface RegenerateQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kitId: string;
  defaultCategory?: string;
  requirements?: { id?: string; topic?: string; category?: string }[];
  onSuccess?: () => void;
}

const CATEGORIES = [
  {
    label: "Technical Questions",
    value: "TECHNICAL",
    desc: "Coding, system design, architectural & technical concepts",
  },
  {
    label: "Behavioral Questions",
    value: "BEHAVIORAL",
    desc: "STAR method, past experiences, conflict resolution & teamwork",
  },
  {
    label: "Role Specific Questions",
    value: "ROLE_SPECIFIC",
    desc: "Domain knowledge tailored specifically to the target role",
  },
];

export function RegenerateQuestionsDialog({
  open,
  onOpenChange,
  kitId,
  defaultCategory = "TECHNICAL",
  requirements = [],
  onSuccess,
}: RegenerateQuestionsDialogProps) {
  const { regenerateQuestions, isLoading, error, setError } = useQuestion();
  const { fetchKit } = useKitStore();

  const [mode, setMode] = useState<"category" | "topic">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("TECHNICAL");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  useEffect(() => {
    if (open) {
      const initialCat =
        defaultCategory && defaultCategory !== "ALL"
          ? defaultCategory.toUpperCase()
          : "TECHNICAL";
      setSelectedCategory(initialCat);
      setMode("category");
      if (requirements.length > 0 && requirements[0].id) {
        setSelectedTopicId(requirements[0].id);
      }
      setError(null);
    }
  }, [open, defaultCategory, requirements, setError]);

  const handleConfirmRegenerate = async () => {
    if (mode === "topic") {
      setError("Topic-based regeneration is coming soon. Please regenerate by category.");
      return;
    }

    if (!selectedCategory) {
      setError("Please select a category to regenerate");
      return;
    }

    try {
      await regenerateQuestions(kitId, selectedCategory);
      // Synchronize kit store
      await fetchKit(kitId, true);
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error handled by useQuestion
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl bg-[#0e1111] border border-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white">
              <RotateCw className="size-3.5" />
            </div>
            <DialogTitle className="text-lg font-semibold tracking-tight text-white">
              Regenerate Questions
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-white/50">
            Regenerate interview questions using fresh AI prompts based on your kit requirements.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400 animate-in fade-in duration-200"
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Mode Selector: Category vs Topic Segmented Control */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-white/80">
              Regenerate By
            </Label>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode("category");
                  setError(null);
                }}
                className={cn(
                  "h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center select-none",
                  mode === "category"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                )}
              >
                Category
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("topic");
                  setError(null);
                }}
                className={cn(
                  "h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none",
                  mode === "topic"
                    ? "bg-white text-black shadow-sm"
                    : "text-white/60 hover:text-white"
                )}
              >
                <span>Topic</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] px-1.5 py-0 font-normal transition-colors",
                    mode === "topic"
                      ? "border-black/20 bg-black/10 text-black"
                      : "border-white/20 bg-white/10 text-white/60"
                  )}
                >
                  Soon
                </Badge>
              </button>
            </div>
          </div>

          {/* Option 1: Category Selection */}
          {mode === "category" ? (
            <div className="space-y-2">
              <Label
                htmlFor="regenerate-category"
                className="text-xs font-medium text-white/80"
              >
                Select Category
              </Label>
              <Select
                value={selectedCategory}
                onValueChange={(val) => {
                  if (val) setSelectedCategory(val);
                }}
              >
                <SelectTrigger
                  id="regenerate-category"
                  className="w-full h-10 bg-white/5 border-white/10 text-white text-sm cursor-pointer rounded-xl focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/20 *:data-[slot=select-value]:text-white"
                >
                  <SelectValue className="text-white" placeholder="Select question category">
                    {(val) => {
                      const found = CATEGORIES.find((c) => c.value === val);
                      return found ? found.label : (val || "Select question category");
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="dark bg-[#121616] border border-white/10 text-white shadow-2xl p-1 z-50 rounded-xl">
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      label={cat.label}
                      className="cursor-pointer rounded-lg text-sm py-2 px-2.5 text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-white">{cat.label}</span>
                        <span className="text-[11px] text-white/40">{cat.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-white/40 pt-1 leading-relaxed">
                Note: Any manually edited questions will be protected and preserved.
              </p>
            </div>
          ) : (
            /* Option 2: Topic Selection (For Future Use) */
            <div className="space-y-2">
              <Label
                htmlFor="regenerate-topic"
                className="text-xs font-medium text-white/80"
              >
                Select Topic
              </Label>
              <Select
                value={selectedTopicId}
                onValueChange={(val) => {
                  if (val) setSelectedTopicId(val);
                }}
                disabled
              >
                <SelectTrigger
                  id="regenerate-topic"
                  className="w-full h-10 bg-white/5 border-white/10 text-white/50 text-sm rounded-xl cursor-not-allowed opacity-60 *:data-[slot=select-value]:text-white/60"
                >
                  <SelectValue className="text-white/60" placeholder="Select topic requirement" />
                </SelectTrigger>
                <SelectContent className="dark bg-[#121616] border border-white/10 text-white shadow-2xl p-1 z-50 rounded-xl">
                  {requirements.map((r, i) => (
                    <SelectItem
                      key={r.id || i}
                      value={r.id || `topic-${i}`}
                      label={r.topic}
                      className="cursor-pointer rounded-lg text-sm py-2 px-2.5 text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      <span className="text-white">{r.topic || "Topic Requirement"}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-start gap-2.5 text-xs text-white/60">
                <Clock className="size-4 text-white/40 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Topic-specific regeneration is planned for an upcoming release. Please switch to the{" "}
                  <button
                    type="button"
                    onClick={() => setMode("category")}
                    className="text-white underline hover:text-white/80 cursor-pointer font-medium"
                  >
                    Category
                  </button>{" "}
                  tab to regenerate questions today.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with clean gap between Cancel and Regenerate */}
        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirmRegenerate}
            disabled={isLoading || mode === "topic"}
            className="h-9 px-4 rounded-xl bg-white hover:bg-white/90 text-black text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 size-3.5" />
                <span>Regenerate Questions</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
