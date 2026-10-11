import type {
  Difficulty,
  QuestionCategory,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { aiService } from "../ai/ai.service.js";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  ReorderQuestionsInput,
} from "./question.schema.js";

interface QuestionInput {
  topic: string;
  category: QuestionCategory;
  question: string;
  guidance: string;
  difficulty: Difficulty;
}

export const questionService = {
  async saveQuestionsForKit(
    kitId: string,
    questions: QuestionInput[],
    requirementId: string,
  ) {
    await prisma.question.createMany({
      data: questions.map((q, index) => ({
        kitId,
        requirementId,
        question: q.question,
        guidance: q.guidance,
        difficulty: q.difficulty,
        category: q.category,
        position: index,
      })),
      skipDuplicates: true,
    });
  },

  async createQuestion(
    kitId: string,
    userId: string,
    data: CreateQuestionInput,
  ) {
    await verifyKitOwnership(kitId, userId);

    // Get the next position by finding the max position in this kit
    const lastQuestion = await prisma.question.findFirst({
      where: { kitId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const nextPosition = (lastQuestion?.position ?? -1) + 1;

    // If requirementId is provided, verify it belongs to this kit
    if (data.requirementId) {
      const requirement = await prisma.requirement.findUnique({
        where: { id: data.requirementId },
      });

      if (!requirement || requirement.kitId !== kitId) {
        throw new ApiError(
          "Requirement not found in this kit",
          404,
          "REQUIREMENT_NOT_FOUND",
        );
      }
    }

    const question = await prisma.question.create({
      data: {
        kitId,
        question: data.question,
        guidance: data.guidance ?? null,
        category: data.category,
        difficulty: data.difficulty,
        requirementId: data.requirementId ?? null,
        position: nextPosition,
        isEdited: true,
      },
    });

    return question;
  },

  async updateQuestion(
    kitId: string,
    questionId: string,
    userId: string,
    data: UpdateQuestionInput,
  ) {
    await verifyKitOwnership(kitId, userId);

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existing) {
      throw new ApiError("Question not found", 404, "QUESTION_NOT_FOUND");
    }

    if (existing.kitId !== kitId) {
      throw new ApiError(
        "Question does not belong to this kit",
        403,
        "QUESTION_KIT_MISMATCH",
      );
    }

    const updateData: Record<string, unknown> = { isEdited: true };
    if (data.question !== undefined) updateData.question = data.question;
    if (data.guidance !== undefined) updateData.guidance = data.guidance;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty;

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });

    return updated;
  },

  async deleteQuestion(kitId: string, questionId: string, userId: string) {
    await verifyKitOwnership(kitId, userId);

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existing) {
      throw new ApiError("Question not found", 404, "QUESTION_NOT_FOUND");
    }

    if (existing.kitId !== kitId) {
      throw new ApiError(
        "Question does not belong to this kit",
        403,
        "QUESTION_KIT_MISMATCH",
      );
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return { deleted: true };
  },

  async reorderQuestions(
    kitId: string,
    userId: string,
    data: ReorderQuestionsInput,
  ) {
    await verifyKitOwnership(kitId, userId);

    const { questions } = data;

    // Check for duplicate question IDs in payload
    const questionIds = questions.map((q) => q.id);
    if (new Set(questionIds).size !== questionIds.length) {
      throw new ApiError(
        "Duplicate question IDs in reorder payload",
        400,
        "DUPLICATE_QUESTION_IDS",
      );
    }

    // Verify all questions exist and belong to this kit
    const existingCount = await prisma.question.count({
      where: {
        id: { in: questionIds },
        kitId,
      },
    });

    if (existingCount !== questionIds.length) {
      throw new ApiError(
        "One or more questions not found or do not belong to this kit",
        404,
        "QUESTION_NOT_FOUND",
      );
    }

    // Execute atomic update in a transaction
    await prisma.$transaction(
      questions.map((q) =>
        prisma.question.update({
          where: { id: q.id },
          data: { position: q.position },
        }),
      ),
    );

    // Return the reordered questions for the kit sorted by position
    return prisma.question.findMany({
      where: { kitId },
      orderBy: { position: "asc" },
    });
  },

  async regenerateCategory(
    kitId: string,
    userId: string,
    category: QuestionCategory,
  ) {
    await verifyKitOwnership(kitId, userId);

    const questions = await prisma.question.findMany({
      where: {
        kitId,
        category,
      },
      orderBy: { position: "asc" },
    });

    const protectedQuestions = questions.filter((q) => q.isEdited);

    const regeneratableQuestions = questions.filter((q) => !q.isEdited);

    const requirements = await prisma.requirement.findMany({
      where: {
        kitId,
        category,
      },
      select: {
        id: true,
        kitId: true,
        topic: true,
        text: true,
        category: true,
        importance: true,
      },
    });

    if (requirements.length === 0 || regeneratableQuestions.length === 0) {
      return prisma.question.findMany({
        where: { kitId },
        orderBy: { position: "asc" },
      });
    }

    const countPerRequirement = Math.max(
      1,
      Math.round(regeneratableQuestions.length / requirements.length),
    );

    const generatedBatches = await Promise.all(
      requirements.map(async (requirement) => {
        const questions = await aiService.generateQuestionsForRequirement({
          kitId: requirement.kitId,
          topic: requirement.topic,
          category: requirement.category,
          requirement: requirement.text,
          text: requirement.text,
          count: countPerRequirement,
        });

        return questions.map((q) => ({
          ...q,
          requirementId: requirement.id,
        }));
      }),
    );

    const newQuestions = generatedBatches.flat();

    // Map positions: reuse positions of deleted questions, or append after highest position
    const availablePositions = regeneratableQuestions
      .map((q) => q.position)
      .sort((a, b) => a - b);

    const lastQuestion = await prisma.question.findFirst({
      where: { kitId },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const maxPosition = lastQuestion?.position ?? 0;

    const questionsToInsert = newQuestions.map((q, idx) => { 
      const slotPosition = availablePositions[idx];
      const position =
        slotPosition !== undefined
          ? slotPosition
          : maxPosition + 1 + (idx - availablePositions.length);

      return {
        kitId,
        requirementId: q.requirementId,
        question: q.question,
        guidance: q.guidance ?? null,
        difficulty: q.difficulty,
        category,
        position,
        isEdited: false,
      };
    });

    // Atomically delete old unedited questions and insert new ones
    const deleteIds = regeneratableQuestions.map((q) => q.id);

    await prisma.$transaction(async (tx) => {
      if (deleteIds.length > 0) {
        await tx.question.deleteMany({
          where: { id: { in: deleteIds } },
        });
      }

      if (questionsToInsert.length > 0) {
        await tx.question.createMany({
          data: questionsToInsert,
        });
      }
    });

    // Return the updated list with protected and new questions sorted by position
    return prisma.question.findMany({
      where: { kitId },
      orderBy: { position: "asc" },
    });
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
