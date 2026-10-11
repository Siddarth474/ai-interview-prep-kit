import { z } from "zod/v4";
import {
  Difficulty,
  QuestionCategory,
} from "../../../generated/prisma/enums.js";

function buildQuestionsSchema(category: QuestionCategory) {
  const questionSchema = z.object({
    question: z.string().describe("A clear, specific interview question"),
    guidance: z
      .string()
      .describe(
        "Key points the interviewer should look for in the candidate's answer",
      ),
    difficulty: z
      .enum([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD])
      .describe("The difficulty level of the question"),
    category: z.enum([category]).describe("The category of the question"),
  });

  return z.object({
    questions: z.array(questionSchema).describe("List of interview questions"),
  });
}

export const createQuestionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  guidance: z.string().optional(),
  category: z.enum(QuestionCategory, {
    message: "Invalid question category",
  }),
  difficulty: z
    .enum(Difficulty, {
      message: "Invalid difficulty level",
    })
    .default(Difficulty.MEDIUM),
  requirementId: z.string().optional(),
});

export const updateQuestionSchema = z
  .object({
    question: z.string().min(1, "Question text cannot be empty"),
    guidance: z.string().nullable(),
    category: z.enum(QuestionCategory, {
      message: "Invalid question category",
    }),
    difficulty: z.enum(Difficulty, {
      message: "Invalid difficulty level",
    }),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export const reorderQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string().min(1, "Question ID is required"),
        position: z.number().int().min(0, "Position must be non-negative"),
      }),
    )
    .min(1, "At least one question is required"),
});

export const technicalQuestionsOutputSchema = buildQuestionsSchema(
  QuestionCategory.TECHNICAL,
);

export const behavioralQuestionsOutputSchema = buildQuestionsSchema(
  QuestionCategory.BEHAVIORAL,
);

export const systemDesignQuestionsOutputSchema = buildQuestionsSchema(
  QuestionCategory.SYSTEM_DESIGN,
);

export const roleSpecificQuestionsOutputSchema = buildQuestionsSchema(
  QuestionCategory.ROLE_SPECIFIC,
);

export const questionCategoryParamSchema = z.enum(QuestionCategory, {
  message: "Invalid question category",
});

export type QuestionsOutput = z.infer<typeof technicalQuestionsOutputSchema>;

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ReorderQuestionsInput = z.infer<typeof reorderQuestionsSchema>;
