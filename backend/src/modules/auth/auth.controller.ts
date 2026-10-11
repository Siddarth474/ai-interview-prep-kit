import type { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

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

      return res
        .status(200)
        .json(new ApiResponse(200, authData, "Login successful"));
    } catch (error) {
      next(error);
    }
  },
};
