import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface QuestionData {
  id: string;
  kitId?: string;
  requirementId?: string | null;
  question: string;
  answer?: string;
  guidance?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | string;
  category?: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" | "COMPANY" | "SYSTEM_DESIGN" | string;
  position?: number;
  isEdited?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

export interface UpdateQuestionPayload {
  question?: string;
  answer?: string;
  guidance?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  category?: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC";
}

export interface DeleteQuestionResponse {
  deleted?: boolean;
  [key: string]: unknown;
}

export const questionService = {
  async updateQuestion(
    kitId: string,
    questionId: string,
    payload: UpdateQuestionPayload
  ): Promise<ApiResponse<QuestionData>> {
    const response = await api.patch<ApiResponse<QuestionData>>(
      `/kits/${kitId}/questions/${questionId}`,
      payload
    );
    return response.data;
  },

  async deleteQuestion(
    kitId: string,
    questionId: string
  ): Promise<ApiResponse<DeleteQuestionResponse>> {
    const response = await api.delete<ApiResponse<DeleteQuestionResponse>>(
      `/kits/${kitId}/questions/${questionId}`
    );
    return response.data;
  },

  async regenerateQuestions(
    kitId: string,
    category: string
  ): Promise<ApiResponse<QuestionData[]>> {
    const response = await api.post<ApiResponse<QuestionData[]>>(
      `/kits/${kitId}/questions/regenerate/${category}`
    );
    return response.data;
  },
};
