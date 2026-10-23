import { KitStatus, FlashcardStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { aiService } from "../ai/ai.service.js";
import { interviewKitService } from "../interviewKit/interviewkit.service.js";
import type {
  CreateFlashcardInput,
  UpdateFlashcardInput,
} from "./flashcard.schema.js";

export const flashcardService = {
  async generateFlashcardsForKit(kitId: string) {
    const questions = await prisma.question.findMany({
      where: { kitId },
      select: { question: true, guidance: true },
    });

    const flashcards = await aiService.generateFlashcardsForKit(
      questions as { question: string; guidance: string }[],
    );
    console.log("Flashcards: ", flashcards);

    await prisma.$transaction(async (tx) => {
      // Remove any existing flashcards for this kit if retrying
      await tx.flashcard.deleteMany({
        where: { kitId },
      });

      for (const [index, f] of flashcards.entries()) {
        await tx.flashcard.create({
          data: {
            front: f.front,
            back: f.back,
            kitId: kitId,
            position: index,
            progress: {
              create: {},
            },
          },
        });
      }

      await interviewKitService.updateKitStatus(kitId, KitStatus.COMPLETED, tx);
    });
  },

  async createFlashcard(
    kitId: string,
    userId: string,
    data: CreateFlashcardInput,
  ) {
    await verifyKitOwnership(kitId, userId);

    // Get the next position by finding the max position in this kit
    const lastCard = await prisma.flashcard.findFirst({
      where: { kitId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const nextPosition = (lastCard?.position ?? -1) + 1;

    // If sourceQuestionId is provided, verify it belongs to this kit
    if (data.sourceQuestionId) {
      const question = await prisma.question.findUnique({
        where: { id: data.sourceQuestionId },
      });

      if (!question || question.kitId !== kitId) {
        throw new ApiError(
          "Source question not found in this kit",
          404,
          "SOURCE_QUESTION_NOT_FOUND",
        );
      }
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        kitId,
        front: data.front,
        back: data.back,
        sourceQuestionId: data.sourceQuestionId ?? null,
        position: nextPosition,
        isUserModified: true,
        progress: {
          create: {},
        },
      },
      include: {
        progress: true,
      },
    });

    return flashcard;
  },

  async updateFlashcard(
    kitId: string,
    flashcardId: string,
    userId: string,
    data: UpdateFlashcardInput,
  ) {
    await verifyKitOwnership(kitId, userId);

    const existing = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!existing) {
      throw new ApiError("Flashcard not found", 404, "FLASHCARD_NOT_FOUND");
    }

    if (existing.kitId !== kitId) {
      throw new ApiError(
        "Flashcard does not belong to this kit",
        403,
        "FLASHCARD_KIT_MISMATCH",
      );
    }

    // If sourceQuestionId is provided and not null, verify it belongs to this kit
    if (data.sourceQuestionId) {
      const question = await prisma.question.findUnique({
        where: { id: data.sourceQuestionId },
      });

      if (!question || question.kitId !== kitId) {
        throw new ApiError(
          "Source question not found in this kit",
          404,
          "SOURCE_QUESTION_NOT_FOUND",
        );
      }
    }

    const updateData: Record<string, unknown> = { isUserModified: true };
    if (data.front !== undefined) updateData.front = data.front;
    if (data.back !== undefined) updateData.back = data.back;
    if (data.sourceQuestionId !== undefined) {
      updateData.sourceQuestionId = data.sourceQuestionId;
    }

    if (data.status !== undefined) {
      updateData.progress = {
        upsert: {
          create: { status: data.status },
          update: { status: data.status },
        },
      };
    }

    const updated = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: updateData,
      include: {
        progress: true,
      },
    });

    return updated;
  },

  async deleteFlashcard(kitId: string, flashcardId: string, userId: string) {
    await verifyKitOwnership(kitId, userId);

    const existing = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!existing) {
      throw new ApiError("Flashcard not found", 404, "FLASHCARD_NOT_FOUND");
    }

    if (existing.kitId !== kitId) {
      throw new ApiError(
        "Flashcard does not belong to this kit",
        403,
        "FLASHCARD_KIT_MISMATCH",
      );
    }

    await prisma.flashcard.delete({
      where: { id: flashcardId },
    });
  },

  async reviewFlashcard(
    kitId: string,
    flashcardId: string,
    userId: string,
    status: FlashcardStatus,
  ) {
    await verifyKitOwnership(kitId, userId);

    const existing = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!existing) {
      throw new ApiError("Flashcard not found", 404, "FLASHCARD_NOT_FOUND");
    }

    if (existing.kitId !== kitId) {
      throw new ApiError(
        "Flashcard does not belong to this kit",
        403,
        "FLASHCARD_KIT_MISMATCH",
      );
    }

    const progress = await prisma.flashcardProgress.upsert({
      where: { flashcardId },
      create: {
        flashcardId,
        status,
        reviewCount: 1,
        lastReviewedAt: new Date(),
      },
      update: {
        status,
        reviewCount: { increment: 1 },
        lastReviewedAt: new Date(),
      },
    });

    return {
      ...existing,
      progress,
    };
  },
};

async function verifyKitOwnership(kitId: string, userId: string) {
  const kit = await prisma.interviewKit.findUnique({
    where: { id: kitId },
  });

  if (!kit) {
    throw new ApiError("Interview kit not found", 404, "KIT_NOT_FOUND");
  }

  if (kit.userId !== userId) {
    throw new ApiError(
      "You do not have access to this kit",
      403,
      "KIT_FORBIDDEN",
    );
  }
}
