import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";
import { ApiError } from "../../utils/ApiError.js";

export const requirementService = {
  async extractRequirements(kitId: string) {
    const existing = await prisma.requirement.findMany({
      where: { kitId },
      orderBy: { position: "asc" },
    });
    if (existing.length > 0) {
      console.log(
        `[RequirementService] Kit ${kitId} already has ${existing.length} requirements. Skipping duplicate extraction.`,
      );
      return existing;
    }

    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId },
      select: {
        id: true,
        jobDescription: true,
      },
    });
    if (!kit) {
      throw new Error("Interview kit not found");
    }
    const extractionResult = await aiService.extractRequirements(
      kit.jobDescription,
    );

    if (
      !extractionResult.isValidJobDescription ||
      !extractionResult.requirements ||
      extractionResult.requirements.length === 0
    ) {
      const reason =
        extractionResult.rejectionReason ||
        "The provided text does not appear to be a valid job description.";
      throw new ApiError(reason, 400, "INVALID_JOB_DESCRIPTION");
    }

    const { requirements } = extractionResult;

    await prisma.$transaction(async (tx) => {
      await tx.requirement.deleteMany({ where: { kitId } });
      await tx.requirement.createMany({
        data: requirements.map((requirement, index) => ({
          kitId,
          text: requirement.text,
          topic: requirement.topic,
          category: requirement.category,
          importance: requirement.importance,
          position: index + 1,
        })),
      });
    });

    return requirements;
  },

  async extractRoleBreakdown(kitId: string) {
    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId },
      select: {
        id: true,
        jobDescription: true,
      },
    });

    if (!kit) {
      throw new Error("Interview kit not found");
    }

    const breakdown = await aiService.extractRoleBreakdown(kit.jobDescription);

    const savedBreakdown = await prisma.roleBreakdown.upsert({
      where: { kitId },
      update: {
        roleTitle: breakdown.roleTitle,
        responsibilities: breakdown.responsibilities,
        requiredSkills: breakdown.requiredSkills,
        technologies: breakdown.technologies,
      },
      create: {
        kitId,
        roleTitle: breakdown.roleTitle,
        responsibilities: breakdown.responsibilities,
        requiredSkills: breakdown.requiredSkills,
        technologies: breakdown.technologies,
      },
    });

    return savedBreakdown;
  },
};

