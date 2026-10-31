-- CreateTable
CREATE TABLE "CompanyBrief" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "industry" TEXT,
    "products" JSONB,
    "culture" JSONB,
    "hiringInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBrief_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyBrief_kitId_key" ON "CompanyBrief"("kitId");

-- AddForeignKey
ALTER TABLE "CompanyBrief" ADD CONSTRAINT "CompanyBrief_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "InterviewKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
