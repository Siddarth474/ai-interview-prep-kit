import { z } from "zod";

export const createKitSchema = z.object({
  companyUrl: z.url("Invalid URL"),
  jobDescription: z.string().min(1, "Job description is required"),
  daysAvailable: z.coerce.number().int().positive("Days available must be a positive integer"),
});

export type CreateKitInput = z.infer<typeof createKitSchema>;