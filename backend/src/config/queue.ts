import { Queue } from "bullmq";
import { redis, QUEUE_NAMES } from "./redis.js";

export interface InterviewKitJobData {
  kitId: string;
}

export const researchQueue = new Queue<InterviewKitJobData>(
  QUEUE_NAMES.GENERATE,
  {
    connection: redis,
  },
);
