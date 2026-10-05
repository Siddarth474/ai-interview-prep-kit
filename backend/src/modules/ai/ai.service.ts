import { geminiProvider } from "../../lib/gemini-provider.js";
import {
  buildRequirementPrompt,
  generateTechnicalQuestionsPrompt,
  generateBehavioralQuestionsPrompt,
  generateSystemDesignQuestionsPrompt,
  generateRoleSpecificQuestionsPrompt,
} from "./prompt.js";
import {
  requirementOutputSchema,
  type RequirementOutput,
} from "../requirement/requirement.schema.js";
import {
  technicalQuestionsOutputSchema,
  behavioralQuestionsOutputSchema,
  systemDesignQuestionsOutputSchema,
  roleSpecificQuestionsOutputSchema,
  type QuestionsOutput,
} from "../question/question.schema.js";
import { prisma } from "../../lib/prisma.js";
import { QuestionCategory } from "../../../generated/prisma/enums.js";
import { calculateBudget } from "../../utils/questionCap.js";
import { questionService } from "../question/question.service.js";
import {
  findRelevantChunks,
  type RetrievalResult,
} from "../research/retrieval.service.js";

export interface Input {
  kitId: string;
  topic: string;
  category: QuestionCategory;
  requirement: string;
  text: string;
  count: number;
}

export const aiService = {

  async extractRequirements(
    jobDescription: string,
  ): Promise<RequirementOutput["requirements"]> {
    const result = await geminiProvider.generateStructuredContent(
      buildRequirementPrompt(jobDescription),
      requirementOutputSchema,
    );

    return result.requirements;
  },

  async generateQuestionsForKit(kitId: string) {
    const requirements = await prisma.requirement.findMany({
      where: { kitId },
    });

    const budgetMap = calculateBudget(requirements);

    for (const requirement of requirements) {
      const key = `${requirement.importance}_${requirement.category}`;
      const count = budgetMap.get(key) || 1;

      const questions = await generateQuestionsForRequirement({ 
        kitId: kitId,
        requirement: requirement.text,
        topic: requirement.topic,
        category: requirement.category,
        text: requirement.text,
        count,
      });

      console.log("This is questions", questions);

      const questionsWithTopic = questions.map((q) => ({
        ...q,
        topic: requirement.topic,
      }));

      await questionService.saveQuestionsForKit(kitId, questionsWithTopic);
    }
  },
};

async function generateQuestionsForRequirement(input: Input) {
  // Retrieve relevant company research chunks for this requirement
  const query = `${input.topic}: ${input.text}`;
  const retrievedChunks = await findRelevantChunks(input.kitId, query);
  const companyContext = formatContextForPrompt(retrievedChunks);

  if (companyContext) {
    console.log(
      `[RAG] Found ${retrievedChunks.length} relevant chunks for "${input.topic}"`,
    );
  } else {
    console.log(`[RAG] No relevant company context found for "${input.topic}"`);
  }

  switch (input.category) {
    case QuestionCategory.TECHNICAL:
      return generateTechnicalQuestions(input, companyContext);

    case QuestionCategory.BEHAVIORAL:
      return generateBehavioralQuestions(input, companyContext);

    case QuestionCategory.SYSTEM_DESIGN:
      return generateSystemDesignQuestions(input, companyContext);

    case QuestionCategory.ROLE_SPECIFIC:
      return generateRoleSpecificQuestions(input, companyContext);

    default:
      throw new Error(`Unsupported question category: ${input.category}`);
  }
}

function formatContextForPrompt(chunks: RetrievalResult[]): string | undefined {
  if (chunks.length === 0) return undefined;

  return chunks
    .map(
      (chunk) =>
        `[Source: ${chunk.title || chunk.url}] (relevance: ${(chunk.similarity * 100).toFixed(0)}%)\n${chunk.content}`,
    )
    .join("\n\n");
}

async function generateTechnicalQuestions(
  input: Input,
  companyContext?: string,
): Promise<QuestionsOutput["questions"]> {
  const result = await geminiProvider.generateStructuredContent(
    generateTechnicalQuestionsPrompt(
      input.topic,
      input.requirement,
      input.count,
      companyContext,
    ),
    technicalQuestionsOutputSchema,
  );

  return result.questions;
}

async function generateBehavioralQuestions(
  input: Input,
  companyContext?: string,
): Promise<QuestionsOutput["questions"]> {
  const result = await geminiProvider.generateStructuredContent(
    generateBehavioralQuestionsPrompt(
      input.topic,
      input.requirement,
      input.count,
      companyContext,
    ),
    behavioralQuestionsOutputSchema,
  );

  return result.questions;
}

async function generateSystemDesignQuestions(
  input: Input,
  companyContext?: string,
): Promise<QuestionsOutput["questions"]> {
  const result = await geminiProvider.generateStructuredContent(
    generateSystemDesignQuestionsPrompt(
      input.topic,
      input.requirement,
      input.count,
      companyContext,
    ),
    systemDesignQuestionsOutputSchema,
  );

  return result.questions;
}

async function generateRoleSpecificQuestions(
  input: Input,
  companyContext?: string,
): Promise<QuestionsOutput["questions"]> {
  const result = await geminiProvider.generateStructuredContent(
    generateRoleSpecificQuestionsPrompt(
      input.topic,
      input.requirement,
      input.count,
      companyContext,
    ),
    roleSpecificQuestionsOutputSchema,
  );

  return result.questions;
}
