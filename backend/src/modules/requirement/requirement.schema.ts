import { z } from "zod/v4";
import {
  QuestionCategory,
  RequirementImportance,
} from "../../../generated/prisma/enums.js";

const requirementItemSchema = z.object({
  text: z.string().describe("The original requirement in concise form"),
  topic: z.string().describe("The skill or topic involved"),
  category: z
    .enum([
      QuestionCategory.TECHNICAL,
      QuestionCategory.BEHAVIORAL,
      QuestionCategory.ROLE_SPECIFIC,
      QuestionCategory.COMPANY,
      QuestionCategory.PROJECT,
      QuestionCategory.SYSTEM_DESIGN,
    ])
    .describe("The category of the requirement"),
  importance: z
    .enum([
      RequirementImportance.LOW,
      RequirementImportance.MEDIUM,
      RequirementImportance.HIGH,
    ])
    .describe("How important this requirement is"),
});

export const requirementOutputSchema = z.object({
  requirements: z
    .array(requirementItemSchema)
    .describe("List of extracted requirements from the job description"),
});

export type Requirement = z.infer<typeof requirementItemSchema>;
export type RequirementOutput = z.infer<typeof requirementOutputSchema>;

