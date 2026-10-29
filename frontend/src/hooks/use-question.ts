import { useState } from "react";
import axios from "axios";
import {
  questionService,
  type UpdateQuestionPayload,
} from "@/services/question.service";

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

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
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to update question");
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
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to delete question");
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateQuestions = async (kitId: string, category: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await questionService.regenerateQuestions(kitId, category);
      if (!res.success) {
        throw new Error(res.message || "Failed to regenerate questions");
      }
      return res.data;
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Failed to regenerate questions");
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateQuestion,
    deleteQuestion,
    regenerateQuestions,
    isLoading,
    error,
    setError,
  };
}
