import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";

export const requirementService = {
  async extractRequirements(kitId: string) {
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
    const requirements = await aiService.extractRequirements(
      kit.jobDescription,
    );
    // save requirements
    await prisma.requirement.createMany({
      data: requirements.map((requirement, index) => ({
        kitId,
        text: requirement.text,
        topic: requirement.topic,
        category: requirement.category,
        importance: requirement.importance,
        position: index,
      })),
    });
    //console.log("Requirements extracted successfully: ", requirements);
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

