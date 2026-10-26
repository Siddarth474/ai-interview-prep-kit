import type { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches JWT expiration)
};

export const AuthHandler = {
  /**
   * Handle user registration
   * POST /auth/signup
   */
  async signupHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = signupSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Signup Validation failed"));
      }

      const authData = await AuthService.signupUser(parseResult.data);

      res.cookie("token", authData.token, COOKIE_OPTIONS);

      return res
        .status(201)
        .json(new ApiResponse(201, authData, "User registered successfully"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user authentication
   * POST /auth/login
   */
  async loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = loginSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res
          .status(400)
          .json(new ApiResponse(400, null, "Login Validation failed"));
      }

      const authData = await AuthService.loginUser(parseResult.data);

      res.cookie("token", authData.token, COOKIE_OPTIONS);

      return res
        .status(200)
        .json(new ApiResponse(200, authData, "Login successful"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current authenticated user profile
   * GET /auth/me
   */
  async getMeHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res
          .status(401)
          .json(new ApiResponse(401, null, "Authentication required"));
      }

      const user = await AuthService.getCurrentUser(userId);

      return res
        .status(200)
        .json(new ApiResponse(200, user, "User fetched successfully"));
    } catch (error) {
      next(error);
    }
  },
};
