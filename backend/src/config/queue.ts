import { Queue } from "bullmq";
import { redis, QUEUE_NAMES } from "./redis.js";

export interface InterviewKitJobData {
  kitId: string;
}

export const researchQueue = new Queue<InterviewKitJobData>(
  QUEUE_NAMES.GENERATE,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 8000,
      },
      removeOnComplete: {
        age: 3600,
        count: 30,
      },
      removeOnFail: {
        age: 24 * 3600,
        count: 50,
      },
    },
  },
);
