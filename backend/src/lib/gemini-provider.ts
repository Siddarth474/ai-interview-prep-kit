import { GoogleGenAI } from "@google/genai";
import { z } from "zod/v4";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as Record<string, unknown>;

  if (err.status === 429 || err.statusCode === 429 || err.code === 429) {
    return true;
  }

  const message = String(err.message || "").toLowerCase();
  return (
    message.includes("429") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit") ||
    message.includes("quota exceeded") ||
    message.includes("too many requests")
  );
}

export const geminiProvider = {
  async generateStructuredContent<T extends z.ZodType>(
    prompt: string,
    schema: T,
  ): Promise<z.infer<T>> {
    const jsonSchema = z.toJSONSchema(schema);

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema,
          },
        });

        const text = response.text;

        if (!text) {
          throw new Error("Gemini returned an empty response");
        }

        const parsed = JSON.parse(text);

        return schema.parse(parsed);
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;
        if (!isRateLimitError(error) || isLastAttempt) {
          throw error;
        }

        // Exponential backoff with jitter (e.g. ~2.5s, ~5.0s, ~10.0s)
        const delay =
          BASE_DELAY_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 500);

        console.warn(
          `[GeminiProvider] Rate limit (429) encountered. Retrying in ${delay}ms (Attempt ${attempt + 1}/${MAX_RETRIES})...`,
        );

        await sleep(delay);
      }
    }

    throw new Error("Gemini generation failed after retries");
  },
};
