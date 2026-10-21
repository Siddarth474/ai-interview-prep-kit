import { z } from "zod";
import { FlashcardStatus } from "../../../generated/prisma/enums.js";

export const flashcardOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().min(1, "Flashcard front cannot be empty"),
      back: z.string().min(1, "Flashcard back cannot be empty"),
    }),
  ),
});

export type FlashcardInput = z.infer<typeof flashcardOutputSchema>;

export const createFlashcardSchema = z.object({
  front: z.string().min(1, "Flashcard front cannot be empty"),
  back: z.string().min(1, "Flashcard back cannot be empty"),
  sourceQuestionId: z.string().optional(),
});

export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;

export const updateFlashcardSchema = z
  .object({
    front: z.string().min(1, "Flashcard front cannot be empty"),
    back: z.string().min(1, "Flashcard back cannot be empty"),
    sourceQuestionId: z.string().nullable().optional(),
    status: z.enum(FlashcardStatus).optional(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided to update",
  });

export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
