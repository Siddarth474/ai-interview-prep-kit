import { Worker } from "bullmq";
import { redis, QUEUE_NAMES } from "../config/redis.js";
import type { InterviewKitJobData } from "../config/queue.js";
import { generationService } from "../modules/generation/generation.service.js";
import { interviewKitService } from "../modules/interviewKit/interviewkit.service.js";
import { KitStatus } from "../../generated/prisma/enums.js";

const generationWorker = new Worker<InterviewKitJobData>(
  QUEUE_NAMES.GENERATE,
  async (job) => {
    console.log(
      `[Worker] Processing research job ${job.id} for kit: ${job.data.kitId}`,
    );

    await generationService.generateKit(job.data.kitId);

    console.log(`[Worker] Completed job ${job.id}`);

    return { kitGenerated: true };
  },
  {
    connection: redis,
    concurrency: 1,
  },
);

generationWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job?.id} completed successfully`);
});

generationWorker.on("failed", async (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed:`, error.message);
  if (job?.data?.kitId) {
    try {
      await interviewKitService.updateKitStatus(job.data.kitId, KitStatus.FAILED);
      console.log(`[Worker] Successfully marked kit ${job.data.kitId} as FAILED in DB`);
    } catch (err) {
      console.error(`[Worker] Failed to update kit status to FAILED:`, err);
    }
  }
});

console.log("[Worker] Research worker started and listening for jobs...");

export { generationWorker };
