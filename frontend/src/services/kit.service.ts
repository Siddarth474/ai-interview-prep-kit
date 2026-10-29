import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";
import type { Flashcard } from "./flashcard.service";

export interface CreateKitPayload {
  companyUrl: string;
  jobDescription: string;
  daysAvailable: number;
}

export interface StudyScheduleTopic {
  id?: string;
  dayId?: string;
  requirementId: string;
  topic: string;
  importance: "HIGH" | "MEDIUM" | "LOW";
  estimatedMinutes?: number | null;
  completed?: boolean;
  requirement?: {
    id: string;
    topic: string;
    category?: string;
    questions?: { id: string }[];
  };
}

export interface StudyScheduleDay {
  id?: string;
  scheduleId?: string;
  dayNumber: number;
  topics: StudyScheduleTopic[];
}

export interface StudySchedule {
  id?: string;
  kitId?: string;
  totalDays: number;
  days: StudyScheduleDay[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RoleBreakdown {
  id?: string;
  kitId?: string;
  roleTitle?: string | null;
  responsibilities?: string[];
  requiredSkills?: string[];
  technologies?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface KitQuestion {
  id?: string;
  position?: number;
  question: string;
  answer?: string;
  guidance?: string;
  category?: "TECHNICAL" | "BEHAVIORAL" | "ROLE_SPECIFIC" | "COMPANY" | "SYSTEM_DESIGN" | string;
  difficulty?: "EASY" | "MEDIUM" | "HARD" | string;
  requirementId?: string | null;
  requirement?: {
    id?: string;
    topic?: string;
    text?: string;
    category?: string;
  } | null;
  [key: string]: unknown;
}

export interface KitRequirement {
  id?: string;
  kitId?: string;
  topic?: string;
  text: string;
  category?: string;
  importance?: string;
  position?: number;
  questions?: KitQuestion[];
  [key: string]: unknown;
}

export interface KitData {
  id?: string;
  userId?: string;
  company?: string;
  companyName?: string | null;
  companyUrl?: string;
  role?: string | null;
  roleTitle?: string | null;
  jobDescription?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  progress?: number;
  requirements?: KitRequirement[];
  roleBreakdown?: RoleBreakdown | null;
  questions?: KitQuestion[];
  questionsCount?: number;
  flashcards?: Flashcard[];
  flashcardsCount?: number;
  daysAvailable?: number;
  daysCount?: number;
  status?: string;
  studySchedule?: StudySchedule | null;
  studyPlan?: StudySchedule | null;
  [key: string]: unknown;
}

export interface GetKitsResponse {
  kits?: KitData[];
  [key: string]: unknown;
}

export interface DeleteKitResponse {
  message?: string;
  id?: string;
  [key: string]: unknown;
}

export interface ToggleDayCompletionResponse {
  dayNumber?: number;
  completed?: boolean;
  progress?: number;
  studySchedule?: StudySchedule | null;
  [key: string]: unknown;
}

export const kitService = {
  async createKit(payload: CreateKitPayload): Promise<ApiResponse<KitData>> {
    const response = await api.post<ApiResponse<KitData>>("/kits", payload);
    return response.data;
  },

  async getKit(kitId: string): Promise<ApiResponse<KitData>> {
    const response = await api.get<ApiResponse<KitData>>(`/kits/${kitId}`);
    return response.data;
  },

  async getKits(): Promise<ApiResponse<GetKitsResponse>> {
    const response = await api.get<ApiResponse<GetKitsResponse>>("/kits");
    return response.data;
  },

  async deleteKit(kitId: string): Promise<ApiResponse<DeleteKitResponse>> {
    const response = await api.delete<ApiResponse<DeleteKitResponse>>(`/kits/${kitId}`);
    return response.data;
  },

  async toggleDayCompletion(
    kitId: string,
    dayNumber: number,
    completed?: boolean,
  ): Promise<ApiResponse<ToggleDayCompletionResponse>> {
    const response = await api.patch<ApiResponse<ToggleDayCompletionResponse>>(
      `/kits/${kitId}/schedule/days/${dayNumber}/complete`,
      { completed },
    );
    return response.data;
  },
};
