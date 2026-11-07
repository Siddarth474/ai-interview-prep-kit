import { z } from "zod";
import { validateJobDescriptionHeuristic } from "../../utils/validateJobDescription.js";

export const createKitSchema = z.object({
  companyUrl: z.url("Invalid URL"),
  jobDescription: z
    .string()
    .min(1, "Job description is required")
    .superRefine((jd, ctx) => {
      const result = validateJobDescriptionHeuristic(jd);
      if (!result.isValid) {
        ctx.addIssue({
          code: "custom",
          message: result.message || "Invalid job description",
        });
      }
    }),
  daysAvailable: z.coerce.number().int().positive("Days available must be a positive integer"),
});

export type CreateKitInput = z.infer<typeof createKitSchema>;

export const deleteKitParamSchema = z.object({ 
  kitId: z.string().min(1, "Kit ID is required"),
});

export type DeleteKitParams = z.infer<typeof deleteKitParamSchema>;

export const retryKitParamSchema = z.object({
  kitId: z.string().min(1, "Kit ID is required"),
});

export type RetryKitParams = z.infer<typeof retryKitParamSchema>;
 