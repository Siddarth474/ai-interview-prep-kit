import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY!,
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  outputDimensionality: 768
});

export { embeddings };
