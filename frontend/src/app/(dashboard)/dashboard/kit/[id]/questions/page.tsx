"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCw,
  Code2,
  Users,
  Briefcase,
  Building2,
  Cpu,
  ArrowRight,
  HelpCircle,
  FilterX,
  Layers,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useKitStore } from "@/hooks/use-kit-store";
import KitLoading from "../loading";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RegenerateQuestionsDialog } from "@/components/question/regenerate-questions-dialog";

interface QuestionItem {
  id?: string;
  position?: number;
  question: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" | "COMPANY" | "SYSTEM_DESIGN" | string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | string;
  guidance?: string;
  requirementId?: string | null;
  requirement?: {
    id?: string;
    topic?: string;
    text?: string;
    category?: string;
  } | null;
}

interface RequirementCardItem {
  id?: string;
  topic: string;
  text?: string;
  category?: string;
  importance?: string;
  questions: QuestionItem[];
}

export const CATEGORY_OPTIONS = [
  {
    value: "TECHNICAL",
    label: "Technical",
    icon: Code2,
  },
  {
    value: "BEHAVIORAL",
    label: "Behavioral",
    icon: Users,
  },
  {
    value: "ROLE_SPECIFIC",
    label: "Role-specific",
    icon: Briefcase,
  },
  {
    value: "COMPANY",
    label: "Company-wise",
    icon: Building2,
  },
  {
    value: "SYSTEM_DESIGN",
    label: "System Design",
    icon: Cpu,
  },
] as const;

export function normalizeCategory(category?: string): string {
  const upper = (category || "").toUpperCase().trim();
  if (upper.includes("SYSTEM") || upper.includes("DESIGN")) return "SYSTEM_DESIGN";
  if (upper.includes("COMPANY")) return "COMPANY";
  if (upper.includes("ROLE")) return "ROLE_SPECIFIC";
  if (upper.includes("BEHAVIOR")) return "BEHAVIORAL";
  return "TECHNICAL";
}

function getTopicIcon(category?: string) {
  const norm = normalizeCategory(category);
  if (norm === "BEHAVIORAL") return Users;
  if (norm === "ROLE_SPECIFIC") return Briefcase;
  if (norm === "COMPANY") return Building2;
  if (norm === "SYSTEM_DESIGN") return Cpu;
  return Code2;
}


export default function KitQuestionsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchKit(id);
    }
  }, [id, fetchKit]);

  const toggleCategory = (val: string) => {
    setSelectedCategories((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // All questions extracted from requirements or fallback to kit?.questions
  const allQuestions: QuestionItem[] = useMemo(() => {
    if (Array.isArray(kit?.requirements) && kit.requirements.length > 0) {
      const extracted = kit.requirements.flatMap((r: any) =>
        (r.questions || []).map((q: any) => ({
          ...q,
          requirementId: q.requirementId || r.id,
          requirement: q.requirement || {
            id: r.id,
            topic: r.topic,
            text: r.text,
            category: r.category,
          },
        }))
      );
      if (extracted.length > 0) return extracted;
    }

    return Array.isArray(kit?.questions) && kit.questions.length > 0
      ? kit.questions
      : [];
  }, [kit?.requirements, kit?.questions]);

  // Build requirements list with attached questions
  const requirementCards: RequirementCardItem[] = useMemo(() => {
    // 1. If backend returned kit.requirements, use them
    if (Array.isArray(kit?.requirements) && kit.requirements.length > 0) {
      return kit.requirements.map((req: any) => {
        const questionsForReq =
          Array.isArray(req.questions) && req.questions.length > 0
            ? req.questions
            : allQuestions.filter(
                (q) =>
                  q.requirementId === req.id ||
                  q.requirement?.id === req.id ||
                  (q.requirement?.topic &&
                    q.requirement.topic.toLowerCase() === req.topic.toLowerCase())
              );

        return {
          id: req.id,
          topic: req.topic,
          text: req.text,
          category: req.category || "TECHNICAL",
          importance: req.importance,
          questions: questionsForReq,
        };
      });
    }

    // 2. If kit has questions, group questions by requirement topic
    if (allQuestions.length > 0) {
      const groupsMap = new Map<string, RequirementCardItem>();

      allQuestions.forEach((q) => {
        const topic =
          q.requirement?.topic ||
          (q.category
            ? `${q.category.charAt(0) + q.category.slice(1).toLowerCase()} Concepts`
            : "General Concepts");

        if (!groupsMap.has(topic)) {
          groupsMap.set(topic, {
            id: q.requirementId || q.requirement?.id || topic,
            topic,
            text: q.requirement?.text,
            category: q.requirement?.category || q.category || "TECHNICAL",
            questions: [],
          });
        }
        groupsMap.get(topic)!.questions.push(q);
      });

      return Array.from(groupsMap.values());
    }

    // 3. Fallback to empty list if kit has no requirements or questions yet
    return [];
  }, [kit?.requirements, allQuestions]);

  // Counts for each category option
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TECHNICAL: 0,
      BEHAVIORAL: 0,
      ROLE_SPECIFIC: 0,
      COMPANY: 0,
      SYSTEM_DESIGN: 0,
    };

    requirementCards.forEach((req) => {
      const normalized = normalizeCategory(req.category);
      counts[normalized] = (counts[normalized] || 0) + 1;
    });

    return counts;
  }, [requirementCards]);

  // Filter requirement cards by selected categories
  const filteredRequirements = useMemo(() => {
    if (selectedCategories.length === 0) return requirementCards;
    return requirementCards.filter((req) => {
      const cat = normalizeCategory(req.category);
      return selectedCategories.includes(cat);
    });
  }, [requirementCards, selectedCategories]);

  if (loading && !kit) {
    return <KitLoading />;
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
          <Link
            href={`/dashboard/kit/${id}`}
            className="size-9 sm:size-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors shrink-0 mt-0.5 sm:mt-0"
            title="Back to Overview"
            aria-label="Back to Overview"
          >
            <ArrowLeft className="size-4 sm:size-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Interview Questions
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-2xl leading-relaxed">
              Explore interview questions structured by target role requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar: Faceted Popover + Command Filter & Regenerate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        {/* Left Side: Category Popover Filter & Active Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Popover>
            <PopoverTrigger
              type="button"
              className={cn(
                "h-9 px-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-medium text-white/90 flex items-center gap-2 transition-all cursor-pointer select-none shrink-0",
                selectedCategories.length > 0 && "border-solid border-white/30 bg-white/10 text-white"
              )}
            >
              <SlidersHorizontal className="size-3.5 text-white/70 shrink-0" />
              <span>Category</span>
              {selectedCategories.length > 0 && (
                <>
                  <div className="h-4 w-px bg-white/20 mx-0.5" />
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 rounded-md bg-white text-black font-semibold text-[11px] lg:hidden"
                  >
                    {selectedCategories.length}
                  </Badge>
                  <div className="hidden lg:flex items-center gap-1">
                    {selectedCategories.length > 2 ? (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 rounded-md bg-white/15 text-white font-medium text-[11px]"
                      >
                        {selectedCategories.length} selected
                      </Badge>
                    ) : (
                      selectedCategories.map((val) => {
                        const opt = CATEGORY_OPTIONS.find((o) => o.value === val);
                        return (
                          <Badge
                            key={val}
                            variant="secondary"
                            className="h-5 px-1.5 rounded-md bg-white/15 text-white font-medium text-[11px]"
                          >
                            {opt?.label || val}
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </PopoverTrigger>

            <PopoverContent
              className="w-56 p-0 border border-white/10 bg-[#131515] text-white shadow-2xl rounded-xl overflow-hidden"
              align="start"
              sideOffset={6}
            >
              <Command className="bg-transparent text-white">
                <CommandInput
                  placeholder="Filter category..."
                  className="text-white placeholder:text-white/40 text-xs"
                />
                <CommandList className="max-h-64 p-1">
                  <CommandEmpty className="text-white/50 text-xs py-3 text-center">
                    No category found.
                  </CommandEmpty>
                  <CommandGroup>
                    {CATEGORY_OPTIONS.map((option) => {
                      const isSelected = selectedCategories.includes(option.value);
                      const Icon = option.icon;
                      const count = categoryCounts[option.value] || 0;

                      return (
                        <CommandItem
                          key={option.value}
                          value={option.label}
                          onSelect={() => toggleCategory(option.value)}
                          className={cn(
                            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors text-white/80 hover:text-white hover:bg-white/10",
                            isSelected && "bg-white/10 text-white"
                          )}
                        >
                          <div
                            className={cn(
                              "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                              isSelected
                                ? "bg-white border-white text-black"
                                : "border-white/30 bg-transparent text-transparent"
                            )}
                          >
                            <Check className="size-3 stroke-3" />
                          </div>
                          <Icon className="size-3.5 text-white/60 shrink-0" />
                          <span className="truncate flex-1">{option.label}</span>
                          <span
                            data-slot="command-shortcut"
                            className="ml-auto font-mono text-[11px] text-white/40"
                          >
                            {count}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>

                  {selectedCategories.length > 0 && (
                    <>
                      <CommandSeparator className="bg-white/10 my-1" />
                      <CommandGroup>
                        <CommandItem
                          onSelect={clearCategories}
                          className="justify-center text-center text-xs font-medium text-white/60 hover:text-white hover:bg-white/10 py-1.5 cursor-pointer rounded-lg"
                        >
                          Clear filters
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Quick Active Filter Badges (Removable chips) */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedCategories.map((val) => {
                const opt = CATEGORY_OPTIONS.find((o) => o.value === val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => toggleCategory(val)}
                    className="h-7 px-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs flex items-center gap-1.5 transition-colors cursor-pointer group"
                    title={`Remove ${opt?.label || val} filter`}
                  >
                    <span>{opt?.label || val}</span>
                    <X className="size-3 text-white/40 group-hover:text-white transition-colors" />
                  </button>
                );
              })}
              <button
                type="button"
                onClick={clearCategories}
                className="h-7 px-2 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Small Regenerate Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRegenerateOpen(true)}
          className="h-9 px-3 rounded-xl border border-white/10 bg-[#161a1a] hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-1.5 shrink-0 transition-colors cursor-pointer select-none self-start sm:self-auto"
        >
          <RotateCw className="size-3.5 text-white/70" />
          <span>Regenerate</span>
        </Button>
      </div>

      {/* Requirement Cards List */}
      <div className="flex flex-col gap-4 sm:gap-4.5 w-full">
        {filteredRequirements.length > 0 ? (
          filteredRequirements.map((req, idx) => {
            const TopicIcon = getTopicIcon(req.category);
            const questionCount = req.questions.length;
            const firstQuestion = req.questions[0];
            const targetUrl = firstQuestion?.id
              ? `/dashboard/kit/${id}/questions/${firstQuestion.id}`
              : `/dashboard/kit/${id}/questions/${idx + 1}`;

            return (
              <Card
                key={req.id || req.topic || idx}
                className="rounded-2xl border border-white/10 bg-[#0d1010] p-5 sm:p-6 transition-all duration-200 hover:border-white/20 hover:bg-[#111414] shadow-sm flex flex-col justify-between gap-4 select-none"
              >
                {/* Card Main Info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                    <div className="size-10 sm:size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0 mt-0.5">
                      <TopicIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {req.topic}
                        </h2>
                        {req.category && (
                          <Badge
                            variant="outline"
                            className="h-5 px-2 text-[10px] font-semibold uppercase tracking-wider border-white/10 bg-white/5 text-white/70"
                          >
                            {req.category}
                          </Badge>
                        )}
                        {req.importance && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "h-5 px-2 text-[10px] font-semibold uppercase tracking-wider border",
                              req.importance === "HIGH" &&
                                "text-amber-400 bg-amber-400/10 border-amber-400/20",
                              req.importance === "MEDIUM" &&
                                "text-blue-400 bg-blue-400/10 border-blue-400/20",
                              req.importance === "LOW" &&
                                "text-white/40 bg-white/5 border-white/10"
                            )}
                          >
                            {req.importance} Priority
                          </Badge>
                        )}
                      </div>

                      {req.text && (
                        <p className="text-xs sm:text-sm text-white/50 mt-1.5 leading-relaxed line-clamp-2">
                          {req.text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Question Count Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-14 sm:pl-0">
                    <div className="h-8 px-3 rounded-xl border border-white/10 bg-white/5 text-white/80 text-xs font-semibold flex items-center gap-1.5">
                      <HelpCircle className="size-3.5 text-white/50" />
                      <span>
                        {questionCount}{" "}
                        {questionCount === 1 ? "question" : "questions"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Summary & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Layers className="size-3.5" />
                    <span>Structured interview practice for this requirement</span>
                  </div>

                  <Link
                    href={targetUrl}
                    className="bg-white hover:bg-white/90 text-black font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm h-9 sm:h-10 shrink-0 shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 group self-stretch sm:self-auto"
                  >
                    <span>View Questions</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-white/10 bg-[#111414] p-8">
            <FilterX className="size-8 text-white/30 mb-3" />
            <h3 className="text-sm font-semibold text-white">
              No requirements found
            </h3>
            <p className="text-xs text-white/40 mt-1 mb-4">
              {selectedCategories.length > 0
                ? "Try adjusting your category filter."
                : "No interview questions or requirements found for this kit yet."}
            </p>
            {selectedCategories.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCategories}
                className="text-xs rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Regenerate Questions Dialog */}
      <RegenerateQuestionsDialog
        open={isRegenerateOpen}
        onOpenChange={setIsRegenerateOpen}
        kitId={id}
        requirements={kit?.requirements}
        defaultCategory={
          selectedCategories.length === 1 ? selectedCategories[0] : "TECHNICAL"
        }
      />
    </div>
  );
}
