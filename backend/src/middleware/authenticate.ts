import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const JWT_SECRET =
  process.env.ACCESS_TOKEN as string;

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | undefined;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined;

    const token =
      req.cookies?.accessToken || tokenFromHeader;

    if (!token) {
      throw new ApiError("Authentication required", 401, "NO_TOKEN");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Invalid or expired token", 401, "INVALID_TOKEN");
  }
}
