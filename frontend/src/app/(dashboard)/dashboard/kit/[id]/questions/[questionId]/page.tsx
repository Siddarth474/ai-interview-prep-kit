"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  MoreVertical,
  Copy,
  Check,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useKitStore } from "@/hooks/use-kit-store";
import type { KitRequirement, KitQuestion } from "@/services/kit.service";
import KitLoading from "../../loading";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UpdateQuestionDialog } from "@/components/question/update-question-dialog";
import { DeleteQuestionDialog } from "@/components/question/delete-question-dialog";

interface QuestionItem {
  id?: string;
  position?: number;
  question: string;
  answer?: string;
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

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kitId = (params?.id as string) || "";
  const questionId = (params?.questionId as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  const [copied, setCopied] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (kitId) {
      fetchKit(kitId);
    }
  }, [kitId, fetchKit]);

  const requirements = kit?.requirements;

  // Extract all questions directly from requirements
  const questionsList: QuestionItem[] = useMemo(() => {
    if (!Array.isArray(requirements)) return [];
    return requirements.flatMap((r: KitRequirement) =>
      (r.questions || []).map((q: KitQuestion) => ({
        ...q,
        category: q.category || "TECHNICAL",
        difficulty: q.difficulty || "MEDIUM",
        requirementId: q.requirementId || r.id,
        requirement: q.requirement || {
          id: r.id,
          topic: r.topic,
          text: r.text,
          category: r.category,
        },
      })),
    );
  }, [requirements]);

  // Find target question from questions list (or null if not found)
  const currentQuestion: QuestionItem | null = useMemo(() => {
    if (questionsList.length === 0) return null;

    // 1. Match by id
    const byId = questionsList.find((q) => q.id === questionId);
    if (byId) return byId;

    // 2. Match by position or index
    const posNum = parseInt(questionId, 10);
    if (!isNaN(posNum)) {
      const byPos = questionsList.find((q) => q.position === posNum);
      if (byPos) return byPos;

      if (posNum >= 0 && posNum < questionsList.length) {
        return questionsList[posNum];
      }
    }

    return questionsList[0] || null;
  }, [questionsList, questionId]);

  // Filter only questions belonging to the same requirement as currentQuestion
  const requirementQuestions: QuestionItem[] = useMemo(() => {
    if (!currentQuestion) return [];

    const reqId =
      currentQuestion.requirementId || currentQuestion.requirement?.id;
    const reqTopic = currentQuestion.requirement?.topic;

    let filtered: QuestionItem[] = [];

    if (reqId) {
      filtered = questionsList.filter(
        (q) => q.requirementId === reqId || q.requirement?.id === reqId,
      );
    }

    if (filtered.length === 0 && reqTopic) {
      filtered = questionsList.filter(
        (q) =>
          q.requirement?.topic &&
          q.requirement.topic.toLowerCase() === reqTopic.toLowerCase(),
      );
    }

    if (filtered.length === 0 && currentQuestion.category) {
      filtered = questionsList.filter(
        (q) => q.category === currentQuestion.category,
      );
    }

    const result = filtered.length > 0 ? filtered : [currentQuestion];
    return [...result].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }, [questionsList, currentQuestion]);

  // Current question index strictly within this requirement's questions
  const currentIndexInReq = useMemo(() => {
    if (!currentQuestion) return 0;
    const idx = requirementQuestions.findIndex(
      (q) =>
        q.id === currentQuestion.id || q.question === currentQuestion.question,
    );
    return idx !== -1 ? idx : 0;
  }, [requirementQuestions, currentQuestion]);

  // Navigation is strictly confined between questions of the same requirement
  const prevQuestion =
    currentIndexInReq > 0 ? requirementQuestions[currentIndexInReq - 1] : null;
  const nextQuestion =
    currentIndexInReq < requirementQuestions.length - 1
      ? requirementQuestions[currentIndexInReq + 1]
      : null;

  const handleCopyQuestion = () => {
    if (currentQuestion?.question) {
      navigator.clipboard.writeText(currentQuestion.question);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !kit) {
    return <KitLoading />;
  }

  // Handle emptiness state if no questions or current question not found
  if (!currentQuestion) {
    return (
      <div className="flex flex-col gap-6 w-full text-white max-w-4xl mx-auto py-8">
        <Link
          href={`/dashboard/kit/${kitId}/questions`}
          className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer group w-fit select-none"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Topics</span>
        </Link>

        <Card className="rounded-2xl border border-white/10 bg-[#0d1010] p-12 flex flex-col items-center justify-center text-center">
          <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <HelpCircle className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-white">No questions found</h2>
          <p className="text-sm text-white/50 max-w-md mt-2 mb-6">
            We couldn&apos;t find this question in your interview kit. It may
            have been removed or not generated yet.
          </p>
          <Link
            href={`/dashboard/kit/${kitId}/questions`}
            className="inline-flex items-center justify-center bg-white hover:bg-white/90 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
          >
            Return to Questions
          </Link>
        </Card>
      </div>
    );
  }

  const category = (currentQuestion.category || "TECHNICAL").toUpperCase();
  const difficulty = (currentQuestion.difficulty || "HARD").toUpperCase();
  const topic =
    currentQuestion.requirement?.topic ||
    (currentQuestion.category
      ? `${currentQuestion.category.charAt(0) + currentQuestion.category.slice(1).toLowerCase()} Concepts`
      : "General Concepts");

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white max-w-5xl mx-auto">
      {/* Top Header Row: Back Link and Next/Prev requirement navigation */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Sidebar Trigger & Back Link */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0" />
          <Link
            href={`/dashboard/kit/${kitId}/questions`}
            className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer group select-none"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Topics</span>
          </Link>
        </div>

        {/* Right: Next / Prev navigation restricted to this requirement */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 font-medium mr-1 select-none">
            Question {currentIndexInReq + 1} of {requirementQuestions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!prevQuestion}
            onClick={() =>
              prevQuestion &&
              router.push(
                `/dashboard/kit/${kitId}/questions/${prevQuestion.id || prevQuestion.position}`,
              )
            }
            className="h-8 px-2.5 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            title={
              prevQuestion
                ? "Previous question in this requirement"
                : "First question"
            }
          >
            <ChevronLeft className="size-4 mr-0.5" />
            <span className="text-xs">Prev</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!nextQuestion}
            onClick={() =>
              nextQuestion &&
              router.push(
                `/dashboard/kit/${kitId}/questions/${nextQuestion.id || nextQuestion.position}`,
              )
            }
            className="h-8 px-2.5 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            title={
              nextQuestion
                ? "Next question in this requirement"
                : "Last question"
            }
          >
            <span className="text-xs">Next</span>
            <ChevronRight className="size-4 ml-0.5" />
          </Button>
        </div>
      </div>

      {/* Requirement Questions Selector Strip (Req: Q1, Q2, Q3...) */}
      {requirementQuestions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-white/40 font-medium shrink-0">
            Questions in this topic:
          </span>
          {requirementQuestions.map((q, idx) => {
            const isCurrent =
              q.id === currentQuestion.id || idx === currentIndexInReq;
            return (
              <button
                key={q.id || idx}
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/kit/${kitId}/questions/${q.id || q.position || idx + 1}`,
                  )
                }
                className={cn(
                  "h-7 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 select-none",
                  isCurrent
                    ? "bg-white text-black shadow-sm font-bold"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10",
                )}
                title={q.question}
              >
                Q{idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Question Title */}
      <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-white tracking-tight leading-snug sm:leading-tight">
        {currentQuestion.question}
      </h1>

      {/* Badges & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {topic && (
            <Badge
              variant="outline"
              className="h-7 px-3 rounded-lg sm:rounded-xl border border-white/15 bg-[#161a1a] text-white/90 text-[11px] sm:text-xs font-medium tracking-wide flex items-center gap-1.5"
            >
              <span>{topic}</span>
            </Badge>
          )}

          <Badge
            variant="outline"
            className="h-7 px-3 rounded-lg sm:rounded-xl border border-white/10 bg-[#161a1a] text-white/80 text-[11px] sm:text-xs font-semibold uppercase tracking-wider"
          >
            {category}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              "h-7 px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider border",
              difficulty === "HARD" &&
                "bg-[#2a1717] text-[#f87171] border-red-500/25",
              difficulty === "MEDIUM" &&
                "bg-[#282110] text-[#facc15] border-yellow-500/25",
              difficulty === "EASY" &&
                "bg-[#13271a] text-[#4ade80] border-emerald-500/25",
            )}
          >
            {difficulty}
          </Badge>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Edit Button - Visible on >= sm */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpdateOpen(true)}
            className="hidden sm:inline-flex h-9 px-3.5 rounded-xl border border-white/10 bg-[#161a1a] hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-2 transition-colors cursor-pointer"
          >
            <Pencil className="size-3.5 text-white/70" />
            <span>Edit</span>
          </Button>

          {/* Delete Button - Visible on >= sm */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span>Delete</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  aria-label="More options"
                  className="size-9 rounded-xl border border-white/10 bg-[#161a1a] hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 bg-[#0e1111] border border-white/10 text-white shadow-xl rounded-xl p-1"
            >
              <DropdownMenuItem
                onClick={handleCopyQuestion}
                className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{copied ? "Copied!" : "Copy Question"}</span>
              </DropdownMenuItem>

              {/* Mobile-only Edit Option */}
              <DropdownMenuItem
                onClick={() => setIsUpdateOpen(true)}
                className="sm:hidden flex items-center gap-2 px-2.5 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              >
                <Pencil className="size-3.5 text-white/70" />
                <span>Edit Question</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="sm:hidden bg-white/10 my-1" />

              {/* Mobile-only Delete Option */}
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                className="sm:hidden flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg cursor-pointer transition-colors"
              >
                <Trash2 className="size-3.5 text-red-400" />
                <span>Delete Question</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs Row using Shadcn Tabs Component */}
      <Tabs defaultValue="answer" className="flex flex-col gap-0 w-full mt-2">
        <TabsList className="bg-transparent p-0 gap-2 h-auto justify-start border-b-0 w-fit">
          <TabsTrigger
            value="answer"
            className="h-10 px-4 sm:px-5 rounded-t-xl rounded-b-none text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-[#141818] text-white/60 hover:text-white hover:bg-[#181d1d] data-active:bg-white data-active:text-black data-[state=active]:bg-white data-[state=active]:text-black shadow-none data-active:shadow-sm border-0"
          >
            Model Answer
          </TabsTrigger>

          <TabsTrigger
            value="guidance"
            className="h-10 px-4 sm:px-5 rounded-t-xl rounded-b-none text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-[#141818] text-white hover:text-white hover:bg-[#181d1d] data-active:bg-white data-active:text-black data-[state=active]:bg-white data-[state=active]:text-black shadow-none data-active:shadow-sm border-0"
          >
            Additional Guidance
          </TabsTrigger>
        </TabsList>

        {/* Content Box */}
        <Card className="rounded-2xl rounded-tl-none border border-white/10 bg-[#0d1010] p-6 sm:p-7 shadow-xl min-h-40">
          <TabsContent value="answer" className="mt-0 outline-none">
            <div className="min-h-25 flex items-center justify-center text-white text-xs sm:text-sm italic">
              {currentQuestion.answer}
            </div>
          </TabsContent>

          <TabsContent value="guidance" className="mt-0 outline-none">
            {/* Additional Guidance tab */}
            <div className="text-sm sm:text-base text-white leading-relaxed font-normal whitespace-pre-wrap">
              {currentQuestion.guidance || (
                <span className="text-white/40 italic">
                  No additional guidance provided for this question.
                </span>
              )}
            </div>
          </TabsContent>
        </Card>
      </Tabs>

      {/* Edit Question Dialog */}
      <UpdateQuestionDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        kitId={kitId}
        question={currentQuestion}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteQuestionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        kitId={kitId}
        questionId={currentQuestion.id}
        onSuccess={() => router.push(`/dashboard/kit/${kitId}/questions`)}
      />
    </div>
  );
}
