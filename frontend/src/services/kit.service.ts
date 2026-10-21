import { api } from "@/lib/api";
import type { ApiResponse } from "@/types";

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

export interface KitData {
  id?: string;
  userId?: string;
  company?: string;
  companyName?: string | null;
  companyUrl?: string;
  jobDescription?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  progress?: number;
  questions?: any;
  questionsCount?: number;
  flashcards?: any;
  flashcardsCount?: number;
  daysAvailable?: number;
  daysCount?: number;
  status?: string;
  role?: string;
  createdDate?: string;
  studySchedule?: StudySchedule | null;
  studyPlan?: StudySchedule | null;
  [key: string]: any;
}

export const kitService = {
  async createKit(payload: CreateKitPayload): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>("/kits", payload);
    return response.data;
  },

  async getKit(kitId: string): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>(`/kits/${kitId}`);
    return response.data;
  },

  async getKits(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>(`/kits`);
    return response.data;
  },

  async deleteKit(kitId: string): Promise<ApiResponse<any>> {
    const response = await api.delete<ApiResponse<any>>(`/kits/${kitId}`);
    return response.data;
  },
};
