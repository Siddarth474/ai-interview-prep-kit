-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "ResearchChunk" (
    "id" TEXT NOT NULL,
    "researchSourceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "embedding" vector(768) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchChunk_researchSourceId_idx" ON "ResearchChunk"("researchSourceId");

-- AddForeignKey
ALTER TABLE "ResearchChunk" ADD CONSTRAINT "ResearchChunk_researchSourceId_fkey" FOREIGN KEY ("researchSourceId") REFERENCES "ResearchSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
