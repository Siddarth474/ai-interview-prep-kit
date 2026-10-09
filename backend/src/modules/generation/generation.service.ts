import { aiService } from "../ai/ai.service.js";
import { flashcardService } from "../flashcard/flashcard.service.js";
import { requirementService } from "../requirement/requirement.service.js";
import { ingestionService } from "../research/ingestion.service.js";
import { researchService } from "../research/research.service.js";
import { studyScheduleService } from "../studySchedule/studySchedule.service.js";

export const generationService = {
  async generateKit(kitId: string) {
    // Step 1: extract requirements
    await requirementService.extractRequirements(kitId);

    // Step 2: research the company
    await researchService.researchCompany(kitId);

    await ingestionService.ingestForKit(kitId);

    // 3. Understand JD
    await aiService.generateQuestionsForKit(kitId); 

    // 4. Create study schedule
    await studyScheduleService.createStudySchedule(kitId); 

    // 5. Flashcards
    await flashcardService.generateFlashcardsForKit(kitId);

    // await updateStatus(kitId, "COMPLETED");
  },
};
