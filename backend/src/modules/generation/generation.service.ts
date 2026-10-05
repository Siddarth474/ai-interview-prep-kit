import { aiService } from "../ai/ai.service.js";
import { requirementService } from "../requirement/requirement.service.js";
import { ingestionService } from "../research/ingestion.service.js";
import { researchService } from "../research/research.service.js";

export const generationService = {
  async generateKit(kitId: string) {
    // Step 1: extract requirements
    //await requirementService.extractRequirements(kitId);

    // Step 2: research the company
    await researchService.researchCompany(kitId);

    await ingestionService.ingestForKit(kitId);

    // 3. Understand JD
    //await aiService.generateQuestionsForKit(kitId);

    // // 4. Questions
    // await questionService.generate(kitId);

    // // 5. Flashcards
    // await flashcardService.generate(kitId);

    // // 6. Study schedule
    // await studyScheduleService.generate(kitId);

    // await updateStatus(kitId, "COMPLETED");
  },
};
