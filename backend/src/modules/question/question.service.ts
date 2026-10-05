import type { Difficulty, QuestionCategory } from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";

interface QuestionInput {
  topic: string;
  category: QuestionCategory;
  question: string;
  guidance: string;
  difficulty: Difficulty;
}

export const questionService = {

    async saveQuestionsForKit(kitId: string, questions: QuestionInput[]) {
        await prisma.question.createMany({
            data: questions.map((q, index) => ({
                kitId,
                question: q.question,
                guidance: q.guidance,
                difficulty: q.difficulty,
                category: q.category,
                position: index,
            })),
            skipDuplicates: true,
        });
    }
}