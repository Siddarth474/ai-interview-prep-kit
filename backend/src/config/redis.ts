import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
});

export const QUEUE_NAMES = {
  GENERATE: "generate-interview-kit",
} as const;
