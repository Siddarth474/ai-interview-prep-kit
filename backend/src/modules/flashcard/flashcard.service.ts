import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";

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

    await prisma.$transaction(
      flashcards.map((f, index) =>
        prisma.flashcard.create({
          data: {
            front: f.front,
            back: f.back,
            kitId: kitId,
            position: index,
            progress: {
              create: {},
            },
          },
        }),
      ),
    );
  },
};
