import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { InterviewKitHandler } from "./interviewkit.controller.js";
import {
  createKitLimiter,
  retryKitLimiter,
} from "../../middleware/rateLimiter.js";

const kitRouter = Router();

kitRouter.use(authenticate);

kitRouter.post("/", createKitLimiter, InterviewKitHandler.createKitHandler);
kitRouter.post("/:kitId/retry", retryKitLimiter, InterviewKitHandler.retryKitHandler);
kitRouter.get("/", InterviewKitHandler.getUserKitsHandler);
kitRouter.get("/:kitId", InterviewKitHandler.getKitByIdHandler);
kitRouter.delete("/:kitId", InterviewKitHandler.deleteKitHandler);

export { kitRouter };
