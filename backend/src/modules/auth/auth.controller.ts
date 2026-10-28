import type { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 15 * 60 * 1000, // 15 minutes (matches access token expiration)
  path: "/",
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches refresh token expiration)
  path: "/",
};

/**
 * Helper to set both token cookies on the response
 */
function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
}

/**
 * Helper to clear both token cookies
 */
function clearTokenCookies(res: Response) {
  const clearOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
}

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

      setTokenCookies(res, authData.accessToken, authData.refreshToken);

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

      setTokenCookies(res, authData.accessToken, authData.refreshToken);

      return res
        .status(200)
        .json(new ApiResponse(200, authData, "Login successful"));
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user logout — revokes the refresh token
   * POST /auth/logout
   */
  async logoutHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

      if (refreshToken) {
        await AuthService.logoutUser(refreshToken);
      }

      clearTokenCookies(res);

      return res
        .status(200)
        .json(
          new ApiResponse(200, { message: "Logged out successfully" }, "Logged out successfully"),
        );
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh access token using a valid refresh token
   * POST /auth/refresh
   */
  async refreshHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken =
        req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        return res
          .status(401)
          .json(new ApiResponse(401, null, "Refresh token is required"));
      }

      const tokens = await AuthService.refreshTokens(refreshToken);

      setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
            "Token refreshed successfully",
          ),
        );
    } catch (error) {
      // On any refresh failure, clear cookies so client knows to re-login
      clearTokenCookies(res);
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
