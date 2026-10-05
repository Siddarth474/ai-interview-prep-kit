import {
  ResearchSourceStatus,
  ResearchSourceType,
} from "../../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { WebsiteCrawlerService } from "./website-crawl.service.js";

export const researchService = {
  async researchCompany(kitId: string) {

    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId }
    });

    if (!kit)
      throw new ApiError("Interview kit not found", 404, "KIT_NOT_FOUND");

    const pages = await WebsiteCrawlerService.crawl(kit.companyUrl);

    for (const page of pages) {
      await prisma.researchSource.upsert({
        where: {
          kitId_url: {
            kitId,
            url: page.url,
          },
        },

        create: {
          kitId,
          url: page.url,
          title: page.title,
          content: page.content,
          sourceType: ResearchSourceType.COMPANY_WEBSITE,
          status: ResearchSourceStatus.FETCHED,
        },

        update: {
          title: page.title,
          content: page.content,
          status: ResearchSourceStatus.FETCHED,
        },
      });
    }

    return pages;
  },
};
