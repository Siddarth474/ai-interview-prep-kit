import { aiService } from "../ai/ai.service.js";
import { flashcardService } from "../flashcard/flashcard.service.js";
import { requirementService } from "../requirement/requirement.service.js";
import { ingestionService } from "../research/ingestion.service.js";
import { researchService } from "../research/research.service.js";
import { companyBriefService } from "../research/company-brief.service.js";
import { studyScheduleService } from "../studySchedule/studySchedule.service.js";

export const generationService = {
  async generateKit(kitId: string) {
    try {
      await Promise.all([
        requirementService.extractRequirements(kitId),
        requirementService.extractRoleBreakdown(kitId),
      ]);

      await researchService.researchCompany(kitId);

      await Promise.all([
        companyBriefService.generateCompanyBrief(kitId),
        ingestionService.ingestForKit(kitId),
      ]);

      await aiService.generateQuestionsForKit(kitId);

      await studyScheduleService.createStudySchedule(kitId);

      await flashcardService.generateFlashcardsForKit(kitId);
    } catch (error) {
      console.error(
        `[GenerationService] Generation failed for kit: ${kitId}`,
        error,
      );
      throw error;
    }
  },
};
