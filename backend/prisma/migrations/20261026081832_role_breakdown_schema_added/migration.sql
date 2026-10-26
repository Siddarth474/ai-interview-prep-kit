-- CreateTable
CREATE TABLE "RoleBreakdown" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "roleTitle" TEXT,
    "responsibilities" JSONB,
    "requiredSkills" JSONB,
    "technologies" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleBreakdown_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleBreakdown_kitId_key" ON "RoleBreakdown"("kitId");

-- AddForeignKey
ALTER TABLE "RoleBreakdown" ADD CONSTRAINT "RoleBreakdown_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "InterviewKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
