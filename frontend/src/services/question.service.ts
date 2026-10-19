import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface UpdateQuestionPayload {
    question?: string;
    guidance?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    category?: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC";
}

export const questionService = {
    async updateQuestion(kitId: string, questionId: string, payload: UpdateQuestionPayload): Promise<ApiResponse<any>> {
        const response = await api.patch<ApiResponse<any>>(`/kits/${kitId}/questions/${questionId}`, payload);
        return response.data;
    },

    async deleteQuestion(kitId: string, questionId: string): Promise<ApiResponse<any>> {
        const response = await api.delete<ApiResponse<any>>(`/kits/${kitId}/questions/${questionId}`);
        return response.data;
    }
}