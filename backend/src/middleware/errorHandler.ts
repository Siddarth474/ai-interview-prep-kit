import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.code !== undefined && { code: err.code }),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      message: "Malformed JSON in request body",
    });
    return;
  }

  console.error("Unhandled error:", err);

  const isDev = process.env.NODE_ENV !== "production";

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(isDev && {
      error: err.message,
      stack: err.stack,
    }),
  });
}
