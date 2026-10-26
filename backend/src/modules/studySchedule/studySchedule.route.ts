import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { studyScheduleHandler } from "./studySchedule.controller.js";

const studyScheduleRouter = Router({ mergeParams: true });

studyScheduleRouter.use(authenticate);

studyScheduleRouter.patch(
  "/days/:dayNumber/complete",
  studyScheduleHandler.toggleDayCompletionHandler,
);

export { studyScheduleRouter };
