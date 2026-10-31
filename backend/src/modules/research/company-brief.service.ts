import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";
import { ResearchSourceStatus } from "../../../generated/prisma/enums.js";
import { ApiError } from "../../utils/ApiError.js";

export const companyBriefService = {
  async generateCompanyBrief(kitId: string) {
    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId },
      select: {
        id: true,
        companyUrl: true,
        companyName: true,
        jobDescription: true,
      },
    });

    if (!kit) {
      throw new ApiError("Interview kit not found", 404, "KIT_NOT_FOUND");
    }

    const sources = await prisma.researchSource.findMany({
      where: {
        kitId,
        status: ResearchSourceStatus.FETCHED,
      },
      select: {
        url: true,
        title: true,
        content: true,
      },
      orderBy: { createdAt: "asc" },
    });

    console.log(
      `[CompanyBrief] Extracting brief for kit ${kitId} from ${sources.length} research sources...`,
    );

    const briefData = await aiService.extractCompanyBrief(
      kit.companyUrl,
      sources,
      kit.jobDescription,
    );

    const companyBrief = await prisma.companyBrief.upsert({
      where: { kitId },
      create: {
        kitId,
        companyName: briefData.companyName,
        overview: briefData.overview,
        industry: briefData.industry,
        products: briefData.products,
        culture: briefData.culture,
        hiringInfo: briefData.hiringInfo,
      },
      update: {
        companyName: briefData.companyName,
        overview: briefData.overview,
        industry: briefData.industry,
        products: briefData.products,
        culture: briefData.culture,
        hiringInfo: briefData.hiringInfo,
      },
    });

    if (!kit.companyName && briefData.companyName) {
      await prisma.interviewKit.update({
        where: { id: kitId },
        data: { companyName: briefData.companyName },
      });
    }

    console.log(
      `[CompanyBrief] Successfully generated and stored CompanyBrief for "${briefData.companyName}" (kit: ${kitId})`,
    );

    return companyBrief;
  },

  async getCompanyBrief(kitId: string) {
    return prisma.companyBrief.findUnique({
      where: { kitId },
    });
  },
};

