"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCw,
  Code2,
  Users,
  Briefcase,
  ArrowRight,
  HelpCircle,
  FilterX,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useKitStore } from "@/hooks/use-kit-store";
import KitLoading from "../loading";
import { RegenerateQuestionsDialog } from "@/components/question/regenerate-questions-dialog";

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

interface RequirementCardItem {
  id?: string;
  topic: string;
  text?: string;
  category?: string;
  importance?: string;
  questions: QuestionItem[];
}

type CategoryFilter = "ALL" | "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC";

function getTopicIcon(category?: string) {
  const upper = (category || "").toUpperCase();
  if (upper.includes("BEHAVIOR")) return Users;
  if (upper.includes("ROLE")) return Briefcase;
  return Code2;
}

export const SAMPLE_REQUIREMENTS: RequirementCardItem[] = [
  {
    id: "sample-req-1",
    topic: "RESTful APIs & Backend Architecture",
    text: "Designing idempotent, scalable REST APIs, handling error states, and managing distributed communication.",
    category: "TECHNICAL",
    importance: "HIGH",
    questions: [
      {
        id: "sample-q-1",
        position: 1,
        question: "How do you handle idempotency in RESTful APIs, particularly for POST requests?",
        category: "TECHNICAL",
        difficulty: "HARD",
      },
      {
        id: "sample-q-2",
        position: 2,
        question: "What is the difference between PUT and PATCH methods?",
        category: "TECHNICAL",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    id: "sample-req-2",
    topic: "Database Optimization & Schema Design",
    text: "Indexing strategies, indexing performance on high-volume read/write tables, and relational normalization.",
    category: "TECHNICAL",
    importance: "HIGH",
    questions: [
      {
        id: "sample-q-3",
        position: 1,
        question: "How do you optimize queries on large PostgreSQL tables?",
        category: "TECHNICAL",
        difficulty: "HARD",
      },
      {
        id: "sample-q-4",
        position: 2,
        question: "Explain WHERE vs HAVING clause in SQL with aggregations.",
        category: "TECHNICAL",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    id: "sample-req-3",
    topic: "React & Next.js Frontend Development",
    text: "Server-side rendering, client component patterns, memoization, and state synchronization.",
    category: "TECHNICAL",
    importance: "MEDIUM",
    questions: [
      {
        id: "sample-q-5",
        position: 1,
        question: "How does the virtual DOM reconciliation work in React?",
        category: "TECHNICAL",
        difficulty: "MEDIUM",
      },
    ],
  },
  {
    id: "sample-req-4",
    topic: "Behavioral & Cross-Functional Collaboration",
    text: "Conflict resolution, technical leadership, agile collaboration, and stakeholder communication.",
    category: "BEHAVIORAL",
    importance: "MEDIUM",
    questions: [
      {
        id: "sample-q-6",
        position: 1,
        question: "Tell me about a time you had a technical disagreement with a teammate.",
        category: "BEHAVIORAL",
        difficulty: "MEDIUM",
      },
    ],
  },
];

export default function KitQuestionsPage() {
  const params = useParams();
  const id = (params?.id as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("ALL");
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchKit(id);
    }
  }, [id, fetchKit]);

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

    // 3. Fallback sample requirements if kit has no questions yet
    return SAMPLE_REQUIREMENTS;
  }, [kit?.requirements, allQuestions]);

  // Filter requirement cards by selected category
  const filteredRequirements = useMemo(() => {
    return requirementCards.filter((req) => {
      if (selectedCategory === "ALL") return true;
      const cat = (req.category || "").toUpperCase();
      if (selectedCategory === "ROLE_SPECIFIC") return cat.includes("ROLE");
      return cat === selectedCategory;
    });
  }, [requirementCards, selectedCategory]);

  // Counts for category filter pills
  const categoryCounts = useMemo(() => {
    const total = requirementCards.length;
    const technical = requirementCards.filter(
      (r) => (r.category || "").toUpperCase() === "TECHNICAL"
    ).length;
    const behavioral = requirementCards.filter(
      (r) => (r.category || "").toUpperCase() === "BEHAVIORAL"
    ).length;
    const roleSpecific = requirementCards.filter((r) =>
      (r.category || "").toUpperCase().includes("ROLE")
    ).length;

    return {
      ALL: total,
      TECHNICAL: technical,
      BEHAVIORAL: behavioral,
      ROLE_SPECIFIC: roleSpecific,
    };
  }, [requirementCards]);

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
              Explore interview questions structured by target role requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar: Category Tabs & Regenerate Button */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none min-w-0">
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
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                )}
              >
                {pill.label} ({pill.count})
              </button>
            );
          })}
        </div>

        {/* Small Regenerate Button positioned inline with filters at the right side */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRegenerateOpen(true)}
          className="h-9 px-3 rounded-lg border border-white/10 bg-[#161a1a] hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-1.5 shrink-0 transition-colors cursor-pointer select-none"
        >
          <RotateCw className="size-3.5 text-white/70" />
          <span>Regenerate</span>
        </Button>
      </div>

      {/* Requirement Cards List (Replaces old accordion) */}
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
              Try adjusting your category filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("ALL")}
              className="text-xs rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              Reset Filters
            </Button>
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
          selectedCategory !== "ALL" ? selectedCategory : "TECHNICAL"
        }
      />
    </div>
  );
}
