-- CreateEnum
CREATE TYPE "ResearchSourceType" AS ENUM ('COMPANY_WEBSITE', 'INTERVIEW_DISCUSSION', 'OTHER');

-- CreateEnum
CREATE TYPE "ResearchSourceStatus" AS ENUM ('PENDING', 'FETCHED', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "ResearchSource" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "status" "ResearchSourceStatus" NOT NULL,
    "sourceType" "ResearchSourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchSource_kitId_idx" ON "ResearchSource"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchSource_kitId_url_key" ON "ResearchSource"("kitId", "url");

-- AddForeignKey
ALTER TABLE "ResearchSource" ADD CONSTRAINT "ResearchSource_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "InterviewKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
