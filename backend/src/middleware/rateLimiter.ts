import type { Request, Response } from "express";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createKitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 2,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if (req.user?.userId) {
      return req.user.userId;
    }
    return ipKeyGenerator(req.ip || "127.0.0.1");
  },
  handler: (_req: Request, res: Response) => {
    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          null,
          "You have reached the kit creation limit (maximum 2 kits per 10 minutes). Please wait before creating another kit.",
        ),
      );
  },
});

export const retryKitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 6,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    if (req.user?.userId) {
      return req.user.userId;
    }
    return ipKeyGenerator(req.ip || "127.0.0.1");
  },
  handler: (_req: Request, res: Response) => {
    return res
      .status(429)
      .json(
        new ApiResponse(
          429,
          null,
          "You have reached the kit retry limit (maximum 6 retries per 10 minutes). Please wait before retrying again.",
        ),
      );
  },
});
