import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { prisma } from "../../lib/prisma.js";
import { embeddings } from "../../lib/embedding-provider.js";
import { ResearchSourceStatus } from "../../../generated/prisma/enums.js";

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
  separators: ["\n\n", "\n", ".", " "],
});

async function chunkContent(content: string) {
  const docs = await splitter.createDocuments([content]);
  return docs.map((doc, index) => ({
    content: doc.pageContent,
    chunkIndex: index,
  }));
}

async function storeChunks(
  researchSourceId: string,
  chunks: { content: string; chunkIndex: number }[],
  vectors: number[][],
) {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vector = vectors[i];

    const vectorString = `[${vector?.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO "ResearchChunk" (id, "researchSourceId", content, "chunkIndex", embedding, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4::vector, NOW())`,
      researchSourceId,
      chunk?.content,
      chunk?.chunkIndex,
      vectorString,
    );
  }
}

async function ingestSource(sourceId: string, content: string) {
  const chunks = await chunkContent(content);

  if (chunks.length === 0) return;

  const texts = chunks.map((c) => c?.content || "");
  const vectors = await Promise.all(texts.map(text => embeddings.embedQuery(text)));

  const emptyCount = vectors.filter((v) => v.length === 0).length;
  if (emptyCount > 0) {
    throw new Error(
      `Embedding API returned ${emptyCount}/${vectors.length} empty vectors. Check model name and API key.`,
    );
  }

  await storeChunks(sourceId, chunks, vectors);
}

export const ingestionService = {

  async ingestForKit(kitId: string) {
    const sources = await prisma.researchSource.findMany({
      where: {
        kitId,
        status: ResearchSourceStatus.FETCHED,
      },
      include: {
        _count: { select: { chunks: true } },
      },
    });

    const pendingSources = sources.filter((s) => s._count.chunks === 0);

    if (pendingSources.length === 0) {
      return;
    }

    for (const source of pendingSources) {
      try {
        await ingestSource(source.id, source.content);
      } catch (error) {
        console.error(`[Ingestion] ✗ Failed: ${source.url}`, error);
      }
    }
  },
};
