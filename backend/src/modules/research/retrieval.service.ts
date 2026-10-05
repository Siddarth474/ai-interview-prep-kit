import { prisma } from "../../lib/prisma.js";
import { embeddings } from "../../lib/embedding-provider.js";

export interface RetrievalResult {
  id: string;
  researchSourceId: string;
  content: string;
  chunkIndex: number;
  similarity: number;
  url: string;
  title: string | null;
}

/**
 * Finds relevant research chunks for a given requirement (query string) within a specific InterviewKit.
 *
 * @param kitId The ID of the InterviewKit to search within.
 * @param query The input requirement or question to search for.
 * @param topK Number of relevant chunks to return (default: 5).
 * @param similarityThreshold Minimum similarity score to include the chunk (default: 0.5).
 * @returns Array of most relevant chunks sorted by similarity.
 */
export async function findRelevantChunks(
  kitId: string,
  query: string,
  topK: number = 5,
  similarityThreshold: number = 0.5,
): Promise<RetrievalResult[]> {
  try {
    if (!query || query.trim() === "") {
      return [];
    }
    if (!kitId) {
      throw new Error("kitId is required to perform a search.");
    }

    const queryEmbedding = await embeddings.embedQuery(query);

    if (!queryEmbedding || queryEmbedding.length === 0) {
      console.warn(
        `[Retrieval] Failed to generate embedding for query: "${query}"`,
      );
      return [];
    }

    const vectorString = `[${queryEmbedding.join(",")}]`;

    const results = await prisma.$queryRaw<RetrievalResult[]>`
      SELECT 
        rc.id,
        rc."researchSourceId",
        rc.content,
        rc."chunkIndex",
        (1 - (rc.embedding <=> ${vectorString}::vector)) AS similarity,
        rs.url,
        rs.title
      FROM "ResearchChunk" rc
      JOIN "ResearchSource" rs ON rc."researchSourceId" = rs.id
      WHERE rs."kitId" = ${kitId}
        AND (1 - (rc.embedding <=> ${vectorString}::vector)) >= ${similarityThreshold}
      ORDER BY rc.embedding <=> ${vectorString}::vector
      LIMIT ${topK};
    `;

    return results;
  } catch (error) {
    console.error("[Retrieval Error]: Failed to find relevant chunks:", error);
    throw new Error("Failed to retrieve relevant context. Please try again.");
  }
}
