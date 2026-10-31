import { z } from "zod/v4";

export const companyBriefOutputSchema = z.object({
  companyName: z
    .string()
    .describe("The official brand or company name (e.g. 'Stripe', 'Airbnb')"),
  overview: z
    .string()
    .describe("A comprehensive 2-4 paragraph summary of what the company does, their mission, core business model, scale, and value proposition"),
  industry: z
    .string()
    .describe("Primary industry or business domain (e.g. 'Fintech / Developer Tools', 'Cloud Infrastructure', 'HealthTech')"),
  products: z
    .object({
      summary: z.string().describe("Brief summary of their product ecosystem or services"),
      flagshipProducts: z.array(
        z.object({
          name: z.string().describe("Product or service name"),
          description: z.string().describe("What the product does and why it matters"),
          targetUsers: z.string().optional().describe("Target market, customer segment, or personas"),
        })
      ).describe("Key products, services, or platforms"),
      techHighlights: z.array(z.string()).optional().describe("Key technologies, architecture highlights, or platforms mentioned"),
    })
    .describe("Structured overview of the company's products and technologies"),
  culture: z
    .object({
      coreValues: z.array(z.string()).describe("Core values, operating principles, or cultural pillars"),
      workEnvironment: z.string().optional().describe("Workplace philosophy (e.g., remote-first, high autonomy, fast iteration)"),
      engineeringCulture: z.string().optional().describe("Engineering practices, code review standards, innovation principles, or open-source mindset"),
    })
    .describe("Company culture, team dynamics, and work ethos"),
  hiringInfo: z
    .object({
      interviewProcess: z.array(z.string()).optional().describe("Key interview stages, rounds, or assessment styles if mentioned or inferred"),
      whatTheyValue: z.array(z.string()).describe("Key traits, leadership competencies, or technical skills they look for in candidates"),
      tipsForCandidates: z.array(z.string()).optional().describe("Actionable preparation tips for interviewing at this company"),
    })
    .describe("Hiring philosophy, candidate expectations, and interview insights"),
});

export type CompanyBriefOutput = z.infer<typeof companyBriefOutputSchema>;

