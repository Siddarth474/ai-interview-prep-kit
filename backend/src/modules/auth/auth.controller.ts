import type { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

export const AuthHandler = {
  /**
   * Handle user registration
   * POST /auth/signup
   */
  async signupHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = signupSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const authData = await AuthService.signupUser(parseResult.data);

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: authData,
      });
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
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        });
      }

      const authData = await AuthService.loginUser(parseResult.data);

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: authData,
      });
    } catch (error) {
      next(error);
    }
  },
};
