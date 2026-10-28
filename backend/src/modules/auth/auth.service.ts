import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma.js";
import type { SignupInput, LoginInput, UserResponse } from "./auth.schema.js";
import { ApiError } from "../../utils/ApiError.js";
import { TokenService, type TokenPair } from "./token.service.js";

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

export const AuthService = {

  async signupUser(input: SignupInput): Promise<AuthResponse> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedUsername = input.username.trim().toLowerCase();

    // Check if email or username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { username: normalizedUsername }],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === normalizedEmail) {
        throw new ApiError(
          "An account with this email already exists",
          409,
          "EMAIL_EXISTS",
        );
      }
      if (existingUser.username.toLowerCase() === normalizedUsername) {
        throw new ApiError("Username is already taken", 409, "USERNAME_EXISTS");
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token pair (access + refresh)
    const tokens: TokenPair = await TokenService.generateTokenPair({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
    });

    return {
      user: newUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  /**
   * Authenticate existing user with email/username and password
   */
  async loginUser(input: LoginInput): Promise<AuthResponse> {
    const identifier = (input.email || input.username || input.identifier || "")
      .trim()
      .toLowerCase();

    if (!identifier) {
      throw new ApiError("Email or username is required", 400, "MISSING_IDENTIFIER");
    }

    // Find user by email or username
    const isEmail = identifier.includes("@");
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: { equals: identifier, mode: "insensitive" } }
        : {
            OR: [
              { username: { equals: identifier, mode: "insensitive" } },
              { email: { equals: identifier, mode: "insensitive" } },
            ],
          },
    });

    // Edge case: User does not exist
    if (!user) {
      throw new ApiError("Email Not Found", 401, "EMAIL_NOT_FOUND");
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ApiError("Invalid password", 401, "INVALID_PASSWORD");
    }

    // Generate token pair (access + refresh)
    const tokens: TokenPair = await TokenService.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const sanitizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: sanitizedUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  },

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
  },

  async getMe(userId: string): Promise<UserResponse> {
    return this.getCurrentUser(userId);
  },

  /**
   * Handle user logout — revoke the provided refresh token
   */
  async logoutUser(refreshToken: string): Promise<{ message: string }> {
    await TokenService.revokeRefreshToken(refreshToken);
    return {
      message: "Logged out successfully",
    };
  },

  /**
   * Refresh the access token using a valid refresh token (with rotation)
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    return TokenService.refreshAccessToken(refreshToken);
  },
};
