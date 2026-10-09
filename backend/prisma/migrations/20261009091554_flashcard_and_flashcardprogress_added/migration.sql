-- CreateEnum
CREATE TYPE "FlashcardStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'MASTERED');

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "sourceQuestionId" TEXT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isUserModified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardProgress" (
    "id" TEXT NOT NULL,
    "flashcardId" TEXT NOT NULL,
    "status" "FlashcardStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastReviewedAt" TIMESTAMP(3),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlashcardProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FlashcardProgress_flashcardId_key" ON "FlashcardProgress"("flashcardId");

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "InterviewKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlashcardProgress" ADD CONSTRAINT "FlashcardProgress_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
