-- CreateTable
CREATE TABLE "StudySchedule" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyScheduleDay" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,

    CONSTRAINT "StudyScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyScheduleTopic" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "importance" "RequirementImportance" NOT NULL,
    "estimatedMinutes" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "StudyScheduleTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudySchedule_kitId_key" ON "StudySchedule"("kitId");

-- CreateIndex
CREATE UNIQUE INDEX "StudyScheduleDay_scheduleId_dayNumber_key" ON "StudyScheduleDay"("scheduleId", "dayNumber");

-- CreateIndex
CREATE INDEX "StudyScheduleTopic_dayId_idx" ON "StudyScheduleTopic"("dayId");

-- CreateIndex
CREATE INDEX "StudyScheduleTopic_requirementId_idx" ON "StudyScheduleTopic"("requirementId");

-- AddForeignKey
ALTER TABLE "StudySchedule" ADD CONSTRAINT "StudySchedule_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "InterviewKit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyScheduleDay" ADD CONSTRAINT "StudyScheduleDay_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "StudySchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyScheduleTopic" ADD CONSTRAINT "StudyScheduleTopic_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "StudyScheduleDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyScheduleTopic" ADD CONSTRAINT "StudyScheduleTopic_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
