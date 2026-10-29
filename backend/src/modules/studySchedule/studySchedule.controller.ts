import type { Request, Response, NextFunction } from "express";
import { studyScheduleService } from "./studySchedule.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

export const studyScheduleHandler = {
  async toggleDayCompletionHandler(
    req: Request<{ kitId: string; dayNumber: string }, unknown, { completed?: boolean }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId, dayNumber } = req.params;
      const dayNum = parseInt(dayNumber, 10);
      if (isNaN(dayNum) || dayNum <= 0) {
        throw new ApiError("Valid day number is required", 400, "INVALID_DAY_NUMBER");
      }

      const { completed } = req.body;
      const result = await studyScheduleService.toggleDayCompletion(
        kitId,
        userId,
        dayNum,
        completed,
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Day completion updated successfully"));
    } catch (error) {
      next(error);
    }
  },
};
