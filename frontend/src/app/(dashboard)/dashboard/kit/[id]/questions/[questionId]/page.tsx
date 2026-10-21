"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  RotateCw,
  MoreVertical,
  Copy,
  Trash2,
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
import KitLoading from "../../loading";
import { UpdateQuestionDialog } from "@/components/question/update-question-dialog";
import { DeleteQuestionDialog } from "@/components/question/delete-question-dialog";

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

// Fallback question data matching the design image
const fallbackQuestion: QuestionItem = {
  id: "2",
  position: 2,
  question:
    "How do you handle idempotency in RESTful APIs, particularly for POST requests that might be retried due to network failures?",
  category: "TECHNICAL",
  difficulty: "HARD",
  requirement: {
    topic: "RESTful APIs & Backend Architecture",
  },
  guidance:
    "Use idempotency keys to ensure the same request is not processed multiple times. Generate a unique key (e.g., UUID) for each request and store it in a database or cache like Redis. If a request with the same key is received again, return the original response without re-executing the business logic.",
};

export default function QuestionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kitId = (params?.id as string) || "";
  const questionId = (params?.questionId as string) || "";
  const { kit, loading, fetchKit } = useKitStore();

  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (kitId) {
      fetchKit(kitId);
    }
  }, [kitId, fetchKit]);

  const questionsList: QuestionItem[] = useMemo(() => {
    return Array.isArray(kit?.questions) && kit.questions.length > 0
      ? kit.questions
      : [];
  }, [kit?.questions]);

  // Find target question
  const questionIndex = useMemo(() => {
    if (questionsList.length === 0) return -1;

    // 1. Match by id
    const byIdIdx = questionsList.findIndex((q) => q.id === questionId);
    if (byIdIdx !== -1) return byIdIdx;

    // 2. Match by position (e.g. "2")
    const posNum = parseInt(questionId, 10);
    if (!isNaN(posNum)) {
      const byPosIdx = questionsList.findIndex((q) => q.position === posNum);
      if (byPosIdx !== -1) return byPosIdx;

      // 3. Match by 0-based array index
      if (posNum >= 0 && posNum < questionsList.length) {
        return posNum;
      }
    }

    return 0;
  }, [questionsList, questionId]);

  const currentQuestion: QuestionItem = useMemo(() => {
    if (questionIndex !== -1 && questionsList[questionIndex]) {
      return questionsList[questionIndex];
    }
    return fallbackQuestion;
  }, [questionIndex, questionsList]);


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

  const category = (currentQuestion.category || "TECHNICAL").toUpperCase();
  const difficulty = (currentQuestion.difficulty || "HARD").toUpperCase();
  const topic =
    currentQuestion.requirement?.topic ||
    (currentQuestion.category
      ? `${currentQuestion.category.charAt(0) + currentQuestion.category.slice(1).toLowerCase()} Concepts`
      : "General Concepts");

  return (
    <div className="flex flex-col gap-6 sm:gap-7 w-full text-white max-w-5xl mx-auto">
      {/* Top Header Row: Back Link and Pagination */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Back Link */}
        <Link
          href={`/dashboard/kit/${kitId}/questions`}
          className="flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer group select-none"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </Link>
      </div>

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUpdateOpen(true)}
            className="h-9 px-3.5 rounded-xl border border-white/10 bg-[#161a1a] hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-2 transition-colors cursor-pointer"
          >
            <Pencil className="size-3.5 text-white/70" />
            <span>Edit</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isRegenerating}
            className="h-9 px-3.5 rounded-xl border border-white/10 bg-[#161a1a] hover:bg-white/10 text-white text-xs sm:text-sm font-medium gap-2 transition-colors cursor-pointer"
          >
            <RotateCw
              className={cn(
                "size-3.5 text-white/70",
                isRegenerating && "animate-spin",
              )}
            />
            <span>Regenerate</span>
          </Button>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="h-9 px-3 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs sm:text-sm font-medium gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Delete</span>
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
                <Copy className="size-3.5" />
                <span>Copy Question</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10 my-1" />
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
            className="h-10 px-4 sm:px-5 rounded-t-xl rounded-b-none text-xs sm:text-sm font-semibold transition-all cursor-pointer bg-[#141818] text-white/60 hover:text-white hover:bg-[#181d1d] data-active:bg-white data-active:text-black data-[state=active]:bg-white data-[state=active]:text-black shadow-none data-active:shadow-sm border-0"
          >
            Additional Guidance
          </TabsTrigger>
        </TabsList>

        {/* Content Box */}
        <Card className="rounded-2xl rounded-tl-none border border-white/10 bg-[#0d1010] p-6 sm:p-7 shadow-xl min-h-40">
          <TabsContent value="answer" className="mt-0 outline-none">
            {/* Model Answer tab kept empty as requested */}
            <div className="min-h-25 flex items-center justify-center text-white/20 text-xs sm:text-sm italic">
              {/* Answer content is empty */}
            </div>
          </TabsContent>

          <TabsContent value="guidance" className="mt-0 outline-none">
            {/* Additional Guidance tab */}
            <div className="text-sm sm:text-base text-white/85 leading-relaxed font-normal whitespace-pre-wrap">
              {currentQuestion.guidance || fallbackQuestion.guidance}
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
