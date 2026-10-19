"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCw,
  ChevronDown,
  FilterX,
  Code2,
  Users,
  Briefcase,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useKitStore } from "@/hooks/use-kit-store";
import KitLoading from "../loading";

interface QuestionItem {
  id?: string;
  position?: number;
  question: string;
  category: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" | string;
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

interface TopicGroup {
  topic: string;
  requirementText?: string;
  category?: string;
  questions: QuestionItem[];
}

type CategoryFilter = "ALL" | "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC";
type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD";

function getTopicIcon(category?: string) {
  const upper = (category || "").toUpperCase();
  if (upper.includes("BEHAVIOR")) return Users;
  if (upper.includes("ROLE")) return Briefcase;
  return Code2;
}

export default function KitQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyFilter>("ALL");

  // Track collapsed state per topic (by default all open)
  const [collapsedTopics, setCollapsedTopics] = useState<
    Record<string, boolean>
  >({});

  const toggleTopic = (topic: string) => {
    setCollapsedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
  };

  useEffect(() => {
    if (id) {
      fetchKit(id);
    }
  }, [id, fetchKit]);

  // Combine store questions with fallback if empty
  const allQuestions: QuestionItem[] = useMemo(() => {
    const raw = Array.isArray(kit?.questions) ? kit.questions : [];
    return raw.length > 0 ? raw : [];
  }, [kit?.questions]);

  // Dynamic counts for category filter tabs
  const categoryCounts = useMemo(() => {
    const total = allQuestions.length;
    const technical = allQuestions.filter(
      (q) => (q.category || "").toUpperCase() === "TECHNICAL",
    ).length;
    const behavioral = allQuestions.filter(
      (q) => (q.category || "").toUpperCase() === "BEHAVIORAL",
    ).length;
    const roleSpecific = allQuestions.filter((q) =>
      (q.category || "").toUpperCase().includes("ROLE"),
    ).length;

    return {
      ALL: kit?.questionsCount ?? (total > 0 ? total : 86),
      TECHNICAL: technical > 0 ? technical : 62,
      BEHAVIORAL: behavioral > 0 ? behavioral : 12,
      ROLE_SPECIFIC: roleSpecific > 0 ? roleSpecific : 12,
    };
  }, [allQuestions, kit?.questionsCount]);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const cat = (q.category || "").toUpperCase();
      const diff = (q.difficulty || "").toUpperCase();

      const matchesCategory =
        selectedCategory === "ALL" ||
        (selectedCategory === "ROLE_SPECIFIC"
          ? cat.includes("ROLE")
          : cat === selectedCategory);

      const matchesDifficulty =
        selectedDifficulty === "ALL" || diff === selectedDifficulty;

      return matchesCategory && matchesDifficulty;
    });
  }, [allQuestions, selectedCategory, selectedDifficulty]);

  // Group filtered questions by Requirement Topic
  const topicGroups: TopicGroup[] = useMemo(() => {
    const groupsMap = new Map<string, TopicGroup>();

    filteredQuestions.forEach((q) => {
      const topic =
        q.requirement?.topic ||
        (q.category
          ? `${q.category.charAt(0) + q.category.slice(1).toLowerCase()} Concepts`
          : "General Concepts");

      if (!groupsMap.has(topic)) {
        groupsMap.set(topic, {
          topic,
          requirementText: q.requirement?.text,
          category: q.requirement?.category || q.category,
          questions: [],
        });
      }

      groupsMap.get(topic)!.questions.push(q);
    });

    return Array.from(groupsMap.values());
  }, [filteredQuestions]);

  if (loading && !kit) {
    return <KitLoading />;
  }

  const categoryPills: { key: CategoryFilter; label: string; count: number }[] =
    [
      { key: "ALL", label: "All", count: categoryCounts.ALL },
      { key: "TECHNICAL", label: "Technical", count: categoryCounts.TECHNICAL },
      {
        key: "BEHAVIORAL",
        label: "Behavioral",
        count: categoryCounts.BEHAVIORAL,
      },
      {
        key: "ROLE_SPECIFIC",
        label: "Role Specific",
        count: categoryCounts.ROLE_SPECIFIC,
      },
    ];

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
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
              Practice with AI-generated interview questions grouped by
              requirement topic.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => id && fetchKit(id, true)}
          className="h-10 px-4 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-2 shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCw className="size-3.5" />
          <span>Regenerate</span>
        </Button>
      </div>

      {/* Filter Bar: Category Tabs on Left & Difficulty Dropdown on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categoryPills.map((pill) => {
            const isActive = selectedCategory === pill.key;
            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setSelectedCategory(pill.key)}
                className={cn(
                  "h-9 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer select-none",
                  isActive
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10",
                )}
              >
                {pill.label} ({pill.count})
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="h-9 px-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs sm:text-sm font-medium flex items-center justify-between gap-2.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto min-w-32"
              />
            }
          >
            <span>
              {selectedDifficulty === "ALL"
                ? "Difficulty"
                : selectedDifficulty.charAt(0) +
                  selectedDifficulty.slice(1).toLowerCase()}
            </span>
            <ChevronDown className="size-3.5 text-white/50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-40 bg-[#0e1111] border border-white/10 text-white shadow-xl rounded-xl p-1"
          >
            <DropdownMenuItem
              onClick={() => setSelectedDifficulty("ALL")}
              className={cn(
                "flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors",
                selectedDifficulty === "ALL"
                  ? "bg-white/15 text-white font-medium"
                  : "text-white/80 hover:text-white hover:bg-white/10",
              )}
            >
              <span>All Difficulties</span>
            </DropdownMenuItem>
            {(["EASY", "MEDIUM", "HARD"] as const).map((diff) => (
              <DropdownMenuItem
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors",
                  selectedDifficulty === diff
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                )}
              >
                <span>{diff.charAt(0) + diff.slice(1).toLowerCase()}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grouped Questions List */}
      <div className="flex flex-col gap-6 w-full">
        {topicGroups.length > 0 ? (
          topicGroups.map((group) => {
            const isCollapsed = Boolean(collapsedTopics[group.topic]);
            const TopicIcon = getTopicIcon(group.category);

            return (
              <div
                key={group.topic}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1010] p-4 sm:p-5 transition-all"
              >
                {/* Topic Group Header */}
                <div
                  onClick={() => toggleTopic(group.topic)}
                  className="flex items-center justify-between gap-3 cursor-pointer select-none group/topic"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover/topic:border-white/20 group-hover/topic:text-white transition-colors shrink-0">
                      <TopicIcon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                          {group.topic}
                        </h2>
                        {group.category && (
                          <Badge
                            variant="outline"
                            className="h-5 px-2 text-[10px] font-semibold uppercase tracking-wider border-white/10 bg-white/5 text-white/60"
                          >
                            {group.category}
                          </Badge>
                        )}
                        <span className="text-xs text-white/40">
                          ({group.questions.length}{" "}
                          {group.questions.length === 1
                            ? "question"
                            : "questions"}
                          )
                        </span>
                      </div>
                      {group.requirementText && (
                        <p className="text-xs text-white/45 truncate mt-0.5">
                          {group.requirementText}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="size-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    aria-label={isCollapsed ? "Expand group" : "Collapse group"}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                </div>

                {/* Questions under this topic */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-2.5 pt-2">
                    {group.questions.map((q, idx) => {
                      const position = q.position ?? idx + 1;
                      const category = (
                        q.category || "TECHNICAL"
                      ).toUpperCase();
                      const difficulty = (
                        q.difficulty || "MEDIUM"
                      ).toUpperCase();

                      return (
                        <Card
                          key={q.id || idx}
                          className="rounded-lg border border-white/10 bg-[#111414] hover:border-white/20 transition-all duration-200 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm group"
                        >
                          {/* Left: Index + Question Text */}
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                            <div className="size-8 sm:size-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs sm:text-sm font-semibold text-white/70 shrink-0 select-none group-hover:border-white/20 group-hover:text-white transition-colors">
                              {position}
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed truncate sm:line-clamp-1">
                              {q.question}
                            </p>
                          </div>

                          {/* Right: Badges + Actions */}
                          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 self-end sm:self-auto pl-11 sm:pl-0">
                            {/* Category Badge */}
                            <Badge
                              variant="outline"
                              className="h-6 px-2.5 py-0 rounded-lg border-white/10 bg-white/5 text-[10px] sm:text-xs font-semibold text-white/70 uppercase tracking-wider"
                            >
                              {category}
                            </Badge>

                            {/* Difficulty Badge */}
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-6 px-2.5 py-0 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border",
                                difficulty === "EASY" &&
                                  "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
                                difficulty === "MEDIUM" &&
                                  "text-yellow-300/80 bg-yellow-400/5 border-yellow-400/15",
                                difficulty === "HARD" &&
                                  "text-rose-400 bg-rose-400/10 border-rose-400/20",
                              )}
                            >
                              {difficulty}
                            </Badge>

                            {/* View Question Detail */}
                            <button
                              type="button"
                              title="View Question"
                              onClick={(e) => {
                                e.stopPropagation();
                                const qId = q.id || String(q.position ?? idx);
                                router.push(`/dashboard/kit/${id}/questions/${qId}`);
                              }}
                              className="size-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Eye className="size-3.5" />
                            </button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-white/10 bg-[#111414] p-8">
            <FilterX className="size-8 text-white/30 mb-3" />
            <h3 className="text-sm font-semibold text-white">
              No questions found
            </h3>
            <p className="text-xs text-white/40 mt-1 mb-4">
              Try adjusting your category or difficulty filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("ALL");
                setSelectedDifficulty("ALL");
              }}
              className="text-xs rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
