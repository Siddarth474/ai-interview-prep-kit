import { prisma } from "../../lib/prisma.js";

type Importance = "HIGH" | "MEDIUM" | "LOW";

type Requirement = {
  id: string;
  topic: string;
  importance: Importance;
  questionCount: number;
};

type ScheduleTopic = {
  requirementId: string;
  topic: string;
  importance: Importance;
  questionCount: number;
};

type StudyDay = {
  dayNumber: number;
  topics: ScheduleTopic[];
  workload: number;
};

const importanceWeight: Record<Importance, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

function calculateWorkload(requirement: Requirement): number {
  return importanceWeight[requirement.importance] * requirement.questionCount;
}

export const studyScheduleService = {
  async createStudySchedule(kitId: string) {
    const kit = await prisma.interviewKit.findUnique({
      where: { id: kitId },
    });

    const requirements = await prisma.requirement.findMany({
      where: { kitId },
      include: {
        questions: true,
      },
    });

    const schedule = generateStudySchedule(
      requirements.map((r) => ({
        id: r.id,
        topic: r.topic,
        importance: r.importance,
        questionCount: r.questions.length,
      })),
      kit?.daysAvailable!,
    );

    console.log("Schedule: ", JSON.stringify(schedule, null, 2));

    await prisma.$transaction(async (tx) => {
      const studySchedule = await tx.studySchedule.create({
        data: {
          kitId: kitId,
          totalDays: schedule.length,
        },
      });

      for (const day of schedule) {
        const studyDay = await tx.studyScheduleDay.create({
          data: {
            scheduleId: studySchedule.id,
            dayNumber: day.dayNumber,
          },
        });

        for (const topic of day.topics) {
          await tx.studyScheduleTopic.create({
            data: {
              dayId: studyDay.id,
              requirementId: topic.requirementId,
              topic: topic.topic,
              importance: topic.importance,
              estimatedMinutes: topic.questionCount * 10,
            },
          });
        }
      }
    });
  },
  
};

function generateStudySchedule(
  requirements: Requirement[],
  totalDays: number,
): StudyDay[] {
  if (totalDays <= 0) {
    throw new Error("totalDays must be greater than 0");
  }

  if (requirements.length === 0) {
    return [];
  }

  // Create all study days first
  const days: StudyDay[] = Array.from({ length: totalDays }, (_, index) => ({
    dayNumber: index + 1,
    topics: [],
    workload: 0,
  }));

  // Calculate workload for every requirement
  const requirementsWithWorkload = requirements.map((requirement) => ({
    ...requirement,
    workload: calculateWorkload(requirement),
  }));

  // Highest workload first
  requirementsWithWorkload.sort((a, b) => b.workload - a.workload);

  // Assign each requirement to the least-loaded day
  for (const requirement of requirementsWithWorkload) {
    const leastLoadedDay = days.reduce((least, current) =>
      current.workload < least.workload ? current : least,
    );

    leastLoadedDay.topics.push({
      requirementId: requirement.id,
      topic: requirement.topic,
      importance: requirement.importance,
      questionCount: requirement.questionCount,
    });

    leastLoadedDay.workload += requirement.workload;
  }

  return days;
}
