import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "default_jwt_secret_dev_key_change_in_prod";

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
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError("Authentication required", 401, "NO_TOKEN");
  }

  const token = header.split(" ")[1];

  if (!token) {
    throw new ApiError("Authentication required", 401, "NO_TOKEN");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if(!decoded) {
      throw new ApiError("Invalid token", 401, "INVALID_TOKEN");
    }
    req.user = decoded;
    next();
  } catch {
    throw new ApiError("Invalid or expired token", 401, "INVALID_TOKEN");
  }
}
