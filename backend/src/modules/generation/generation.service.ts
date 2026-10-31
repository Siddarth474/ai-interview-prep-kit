import { aiService } from "../ai/ai.service.js";
import { flashcardService } from "../flashcard/flashcard.service.js";
import { requirementService } from "../requirement/requirement.service.js";
import { ingestionService } from "../research/ingestion.service.js";
import { researchService } from "../research/research.service.js";
import { companyBriefService } from "../research/company-brief.service.js";
import { studyScheduleService } from "../studySchedule/studySchedule.service.js";

export const generationService = {
  async generateKit(kitId: string) {
    // Step 1: extract requirements & role breakdown from JD
    await Promise.all([
      requirementService.extractRequirements(kitId),
      requirementService.extractRoleBreakdown(kitId),
    ]);

    // Step 2: research the company (crawls pages into ResearchSource)
    await researchService.researchCompany(kitId);

    // Step 3: extract company brief & ingest research chunks for RAG
    await Promise.all([
      companyBriefService.generateCompanyBrief(kitId),
      ingestionService.ingestForKit(kitId),
    ]);

    // Step 4: Generate questions using JD requirements & RAG company context
    await aiService.generateQuestionsForKit(kitId);

    // Step 5: Create study schedule
    await studyScheduleService.createStudySchedule(kitId);

    // Step 6: Generate flashcards
    await flashcardService.generateFlashcardsForKit(kitId);

    // await updateStatus(kitId, "COMPLETED");
  },
};
