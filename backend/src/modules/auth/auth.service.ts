import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import type { SignupInput, LoginInput } from "./auth.schema.js";
import { ApiError } from "../../utils/ApiError.js";

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 12;

export const AuthService = {
  /**
   * Register a new user with email, username, and password
   */
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

    // Generate JWT
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      JWT_SECRET!,
      { expiresIn: "7d" },
    );

    return {
      user: newUser,
      token,
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
      throw new ApiError("Invalid email/username or password", 401, "INVALID_CREDENTIALS");
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new ApiError("Invalid email/username or password", 401, "INVALID_CREDENTIALS");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const sanitizedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: sanitizedUser,
      token,
    };
  },
};
