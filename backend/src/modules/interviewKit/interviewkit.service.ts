import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { researchQueue } from "../../config/queue.js";
import type { CreateKitInput } from "./interviewkit.schema.js";

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
    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId },
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

    return kit;
  },

  async getUserKits(userId: string) {
    const kits = await prisma.interviewKit.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return kits;
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
};
