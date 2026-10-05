import { GoogleGenAI } from "@google/genai";
import { z } from "zod/v4";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiProvider = {
  async generateStructuredContent<T extends z.ZodType>(
    prompt: string,
    schema: T,
  ): Promise<z.infer<T>> {
    const jsonSchema = z.toJSONSchema(schema);

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
  },
};
