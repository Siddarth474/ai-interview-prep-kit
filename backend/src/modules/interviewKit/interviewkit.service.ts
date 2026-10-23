import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { researchQueue } from "../../config/queue.js";
import type { CreateKitInput } from "./interviewkit.schema.js";
import type { KitStatus } from "../../../generated/prisma/enums.js";
import { studyScheduleService } from "../studySchedule/studySchedule.service.js";

export const interviewKitService = {
  async createKit(userId: string, data: CreateKitInput) {
    const { companyUrl, jobDescription, daysAvailable } = data;

    const kit = await prisma.interviewKit.create({
      data: {
        userId,
        companyUrl,
        jobDescription,
        daysAvailable,
      },
    });

    if (!kit)
      throw new ApiError("Failed to create kit", 500, "KIT_CREATION_FAILED");

    await researchQueue.add("research-crawl", {
      kitId: kit.id,
    });

    return kit;
  },

  async getKitById(kitId: string, userId: string) {
    if (!kitId) {
      throw new ApiError("Kit ID is required", 400, "KIT_ID_REQUIRED");
    }

    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId },
      include: {
        flashcards: {
          orderBy: { position: "asc" },
          include: {
            progress: true,
          },
        },
        requirements: {
          orderBy: { position: "asc" },
          include: {
            questions: {
              orderBy: { position: "asc" },
            },
          },
        },
        studySchedule: {
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: {
                topics: {
                  include: {
                    requirement: {
                      select: {
                        id: true,
                        topic: true,
                        category: true,
                        questions: {
                          select: { id: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!kit)
      throw new ApiError("Interview kit not found", 404, "KIT_NOT_FOUND");

    if (kit.userId !== userId) {
      throw new ApiError(
        "You do not have access to this kit",
        403,
        "KIT_FORBIDDEN",
      );
    }

    let schedule = kit.studySchedule;
    if (!schedule && kit.requirements.length > 0) {
      try {
        await studyScheduleService.createStudySchedule(kitId);
        schedule = await prisma.studySchedule.findUnique({
          where: { kitId },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: {
                topics: {
                  include: {
                    requirement: {
                      select: {
                        id: true,
                        topic: true,
                        category: true,
                        questions: {
                          select: { id: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
      } catch (err) {
        console.error("Failed to auto-generate study schedule:", err);
      }
    }

    const totalQuestions = kit.requirements.reduce(
      (acc, r) => acc + (r.questions?.length || 0),
      0,
    );

    return {
      ...kit,
      questionsCount: totalQuestions,
      flashcardsCount: kit.flashcards.length,
      studySchedule: schedule,
      studyPlan: schedule,
    };
  },

  async getUserKits(userId: string) {
    const kits = await prisma.interviewKit.findMany({
      where: { userId },
      include: {
        questions: {
          select: {
            id: true
          }
        },
        flashcards: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      kits: kits.map((kit) => ({
        ...kit,
        questionsCount: kit.questions.length,
        flashcardsCount: kit.flashcards.length,
      })),

    };
  },

  async updateKit(
    kitId: string,
    userId: string,
    data: Partial<CreateKitInput>,
  ) {
    const existing = await prisma.interviewKit.findUnique({
      where: { id: kitId },
    });

    if (!existing)
      throw new ApiError("Interview kit not found", 404, "KIT_NOT_FOUND");

    if (existing.userId !== userId) {
      throw new ApiError(
        "You do not have access to this kit",
        403,
        "KIT_FORBIDDEN",
      );
    }

    const updated = await prisma.interviewKit.update({
      where: { id: kitId },
      data,
    });

    return updated;
  },

  async deleteKit(kitId: string, userId: string) {
    const existing = await prisma.interviewKit.findUnique({
      where: { id: kitId },
    });

    if (!existing)
      throw new ApiError("Interview kit not found", 404, "KIT_NOT_FOUND");

    if (existing.userId !== userId) {
      throw new ApiError(
        "You do not have access to this kit",
        403,
        "KIT_FORBIDDEN",
      );
    }

    await prisma.interviewKit.delete({
      where: { id: kitId },
    });

    return { deleted: true };
  },

  async updateKitStatus(kitId: string, status: KitStatus, tx?: any) {
    const client = tx ?? prisma;
    return await client.interviewKit.update({
      where: { id: kitId },
      data: { status },
    });
  }
};
