import type { Request, Response, NextFunction } from "express";
import { createKitSchema } from "./interviewkit.schema.js";
import { ApiError } from "../../utils/ApiError.js";
import { interviewKitService } from "./interviewkit.service.js";

export const InterviewKitHandler = {
  async createKitHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const parseResult = createKitSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const kit = await interviewKitService.createKit(userId, parseResult.data);

      return res.status(201).json({
        success: true,
        message: "Interview kit created successfully",
        data: kit,
      });
    } catch (error) {
      next(error);
    }
  },
};
