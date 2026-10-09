import { z } from "zod";

export const flashcardOutputSchema = z.object({
  flashcards: z.array(
    z.object({
      front: z.string().min(1, "Flashcard front cannot be empty"),
      back: z.string().min(1, "Flashcard back cannot be empty"),
    }),
  ),
});

export type FlashcardInput = z.infer<typeof flashcardOutputSchema>;
