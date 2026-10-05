import { z } from "zod/v4";
import {
  Difficulty,
  QuestionCategory,
} from "../../../generated/prisma/enums.js";

function buildQuestionsSchema(category: QuestionCategory) {
  const questionSchema = z.object({
    question: z
      .string()
      .describe("A clear, specific interview question"),
    guidance: z
      .string()
      .describe(
        "Key points the interviewer should look for in the candidate's answer",
      ),
    difficulty: z
      .enum([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD])
      .describe("The difficulty level of the question"),
    category: z
      .enum([category])
      .describe("The category of the question"),
  });

  return z.object({
    questions: z
      .array(questionSchema)
      .describe("List of interview questions"),
  });
}

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

export type QuestionsOutput = z.infer<typeof technicalQuestionsOutputSchema>;
