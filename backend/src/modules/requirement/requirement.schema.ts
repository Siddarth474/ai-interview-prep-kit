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
  isValidJobDescription: z
    .boolean()
    .describe(
      "True if the input text represents a legitimate job posting, role specification, or job requirements. False if it is random text, spam, unrelated essays, recipes, or gibberish.",
    ),
  rejectionReason: z
    .string()
    .optional()
    .describe(
      "Short explanation if the text is not a valid job description (e.g. 'Text is an unrelated recipe, not a job description')",
    ),
  requirements: z
    .array(requirementItemSchema)
    .describe("List of extracted requirements from the job description if valid, or empty array if invalid"),
});

export type Requirement = z.infer<typeof requirementItemSchema>;
export type RequirementOutput = z.infer<typeof requirementOutputSchema>;

export const roleBreakdownOutputSchema = z.object({
  roleTitle: z
    .string()
    .describe("The job title or role extracted or inferred from the JD (e.g. 'Senior Full Stack Engineer')"),
  responsibilities: z
    .array(z.string())
    .describe("List of core responsibilities, key daily duties, and ownership areas"),
  requiredSkills: z
    .array(z.string())
    .describe("Core conceptual and domain skills (e.g., 'System Architecture', 'CI/CD Pipelines', 'Agile')"),
  technologies: z
    .array(z.string())
    .describe("Specific programming languages, frameworks, libraries, tools, and databases mentioned (e.g., 'React', 'Node.js', 'PostgreSQL')"),
});

export type RoleBreakdownOutput = z.infer<typeof roleBreakdownOutputSchema>;

