import { useState } from "react";
import {
  questionService,
  type UpdateQuestionPayload,
} from "@/services/question.service";

export function useQuestion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateQuestion = async (
    kitId: string,
    questionId: string,
    payload: UpdateQuestionPayload
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await questionService.updateQuestion(kitId, questionId, payload);
      if (!res.success) {
        throw new Error(res.message || "Failed to update question");
      }
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update question";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuestion = async (kitId: string, questionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await questionService.deleteQuestion(kitId, questionId);
      if (!res.success) {
        throw new Error(res.message || "Failed to delete question");
      }
      return res.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete question";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateQuestion,
    deleteQuestion,
    isLoading,
    error,
    setError,
  };
}