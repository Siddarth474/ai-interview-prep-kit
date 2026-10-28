import type { Request, Response, NextFunction } from "express";
import { createKitSchema, deleteKitParamSchema } from "./interviewkit.schema.js";
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

  async getKitByIdHandler(
    req: Request<{ kitId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const { kitId } = req.params;
      const kit = await interviewKitService.getKitById(kitId, userId);

      return res
        .status(200)
        .json(new ApiResponse(200, kit, "Interview kit fetched successfully"));
    } catch (error) {
      next(error);
    }
  },

  async getUserKitsHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const kits = await interviewKitService.getUserKits(userId);

      return res
        .status(200)
        .json(new ApiResponse(200, kits, "Interview kits fetched successfully"));
    } catch (error) {
      next(error);
    }
  },

  async deleteKitHandler(
    req: Request<{ kitId: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError("Authentication required", 401, "NO_USER");
      }

      const parseParams = deleteKitParamSchema.safeParse(req.params);
      if (!parseParams.success) {
        return res
          .status(400)
          .json(
            new ApiResponse(
              400,
              null,
              parseParams.error.issues[0]?.message || "Invalid kit ID",
            ),
          );
      }

      const { kitId } = parseParams.data;
      const result = await interviewKitService.deleteKit(kitId, userId);

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Interview kit deleted successfully"));
    } catch (error) {
      next(error);
    }
  },
};
