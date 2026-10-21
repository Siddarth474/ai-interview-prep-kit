import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

export type FlashcardStatus = "NOT_STARTED" | "IN_PROGRESS" | "MASTERED";

export interface CreateFlashcardPayload {
  front: string;
  back: string;
  sourceQuestionId?: string;
}

export interface EditFlashcardPayload {
  front?: string;
  back?: string;
  sourceQuestionId?: string | null;
  status?: FlashcardStatus;
}

export type UpdateFlashcardPayload = EditFlashcardPayload;

export interface FlashcardProgress {
  id: string;
  flashcardId: string;
  userId: string;
  status: FlashcardStatus;
  reviewCount: number;
  lastReviewedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Flashcard {
  id: string;
  kitId: string;
  sourceQuestionId?: string | null;
  front: string;
  back: string;
  position: number;
  isUserModified: boolean;
  progress?: FlashcardProgress | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const flashcardService = {
  async createFlashcard(
    kitId: string,
    payload: CreateFlashcardPayload
  ): Promise<ApiResponse<Flashcard>> {
    const response = await api.post<ApiResponse<Flashcard>>(
      `/kits/${kitId}/flashcards`,
      payload
    );
    return response.data;
  },

  async editFlashcard(
    kitId: string,
    flashcardId: string,
    payload: EditFlashcardPayload
  ): Promise<ApiResponse<Flashcard>> {
    const response = await api.patch<ApiResponse<Flashcard>>(
      `/kits/${kitId}/flashcards/${flashcardId}`,
      payload
    );
    return response.data;
  },

  async updateFlashcard(
    kitId: string,
    flashcardId: string,
    payload: EditFlashcardPayload
  ): Promise<ApiResponse<Flashcard>> {
    return this.editFlashcard(kitId, flashcardId, payload);
  },

  async deleteFlashcard(
    kitId: string,
    flashcardId: string
  ): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(
      `/kits/${kitId}/flashcards/${flashcardId}`
    );
    return response.data;
  },
};