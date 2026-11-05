import type { Request, Response, NextFunction } from "express";
import { signupSchema, loginSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { formatZodError } from "../../utils/formatZodError.js";

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 15 * 60 * 1000,
  path: "/",
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
}

function clearTokenCookies(res: Response) {
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/",
  };
  res.clearCookie("accessToken", clearOptions);
  res.clearCookie("refreshToken", clearOptions);
}

export const AuthHandler = {
  async signupHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = signupSchema.safeParse(req.body);

      if (!parseResult.success) {
        const { message, errors } = formatZodError(
          parseResult.error,
          "Signup validation failed",
        );
        return res.status(400).json(new ApiResponse(400, { errors }, message));
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

  async loginHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const parseResult = loginSchema.safeParse(req.body);

      if (!parseResult.success) {
        const { message, errors } = formatZodError(
          parseResult.error,
          "Login validation failed",
        );
        return res.status(400).json(new ApiResponse(400, { errors }, message));
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

  async logoutHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (refreshToken) {
        await AuthService.logoutUser(refreshToken);
      }

      clearTokenCookies(res);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { message: "Logged out successfully" },
            "Logged out successfully",
          ),
        );
    } catch (error) {
      next(error);
    }
  },

  async refreshHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        return res
          .status(401)
          .json(new ApiResponse(401, null, "Refresh token is required"));
      }

      const tokens = await AuthService.refreshTokens(refreshToken);

      setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          "Token refreshed successfully",
        ),
      );
    } catch (error) {
      clearTokenCookies(res);
      next(error);
    }
  },

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
