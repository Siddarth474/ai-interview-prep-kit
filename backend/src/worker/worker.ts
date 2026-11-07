import { Worker, UnrecoverableError } from "bullmq";
import { redis, QUEUE_NAMES } from "../config/redis.js";
import type { InterviewKitJobData } from "../config/queue.js";
import { generationService } from "../modules/generation/generation.service.js";
import { interviewKitService } from "../modules/interviewKit/interviewkit.service.js";
import { KitStatus } from "../../generated/prisma/enums.js";

const generationWorker = new Worker<InterviewKitJobData>(
  QUEUE_NAMES.GENERATE,
  async (job) => {
    const attempt = job.attemptsMade + 1;
    console.log(
      `[Worker] Processing research job ${job.id} (attempt ${attempt}) for kit: ${job.data.kitId}`,
    );

    try {
      await generationService.generateKit(job.data.kitId);
    } catch (error: unknown) {
      const err = error as Error | undefined;
      if (
        err?.message?.includes("INVALID_JOB_DESCRIPTION") ||
        err?.message?.includes("valid job description")
      ) {
        throw new UnrecoverableError(err.message);
      }
      throw error;
    }

    console.log(`[Worker] Completed job ${job.id}`);

    return { kitGenerated: true };
  },
  {
    connection: redis,
    concurrency: 1,
    lockDuration: 120000, // 2 minutes lock to prevent false-alarm stalled jobs
    maxStalledCount: 1,
  },
);

generationWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job?.id} completed successfully`);
});

generationWorker.on("failed", async (job, error) => {
  const attemptsMade = job?.attemptsMade ?? 1;
  const maxAttempts = job?.opts?.attempts ?? 1;

  const isNonRetryable =
    error?.name === "UnrecoverableError" ||
    error.message?.includes("INVALID_JOB_DESCRIPTION") ||
    error.message?.includes("valid job description");

  const hasRetriesLeft = !isNonRetryable && attemptsMade < maxAttempts;

  console.error(
    `[Worker] Job ${job?.id} attempt ${attemptsMade}/${maxAttempts} failed:`,
    error.message,
  );

  if (hasRetriesLeft) {
    console.log(
      `[Worker] Job ${job?.id} has retries remaining. Waiting for backoff retry...`,
    );
    return;
  }

  // All retries exhausted or non-retryable error -> mark kit as FAILED
  if (job?.data?.kitId) {
    try {
      await interviewKitService.updateKitStatus(job.data.kitId, KitStatus.FAILED);
      console.log(
        `[Worker] Marked kit ${job.data.kitId} as FAILED in DB (${isNonRetryable ? "Non-retryable input error" : "All retries exhausted"})`,
      );
    } catch (err) {
      console.error(`[Worker] Failed to update kit status to FAILED:`, err);
    }
  }
});

generationWorker.on("error", (err) => {
  console.error("[Worker] Redis connection/queue error:", err.message);
});

const shutdown = async () => {
  console.log("[Worker] Shutting down worker gracefully...");
  await generationWorker.close();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

console.log("[Worker] Research worker started and listening for jobs...");

export { generationWorker };
