import type { Request, Response, NextFunction } from "express";
import { createKitSchema } from "./interviewkit.schema.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
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
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Kit Creation Validation failed"));
      }

      const kit = await interviewKitService.createKit(userId, parseResult.data);

      return res
        .status(201)
        .json(new ApiResponse(201, kit, "Interview kit created successfully"));
    } catch (error) {
      next(error);
    }
  },
};
