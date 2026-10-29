import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN as string;

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN as string;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export interface AccessTokenPayload { 
  userId: string;
  email: string;
  username: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function getRefreshTokenExpiryDate(): Date {
  const days = parseInt(REFRESH_TOKEN_EXPIRY, 10) || 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
}

export const TokenService = {
  /**
   * Generate short-lived access token (JWT)
   */
  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY as NonNullable<SignOptions["expiresIn"]>,
    });
  },

  /**
   * Verify and decode access token
   */
  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
    } catch {
      throw new ApiError(
        "Invalid or expired access token",
        401,
        "INVALID_ACCESS_TOKEN",
      );
    }
  },

  /**
   * Generate refresh token JWT, hash it with bcrypt, and save to DB
   */
  async generateRefreshToken(userId: string): Promise<string> {
    // 1. Create a signed JWT refresh token
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY as NonNullable<SignOptions["expiresIn"]>,
    });

    // 2. Hash with bcrypt before storing in database
    const hashToken = await bcrypt.hash(refreshToken, 10);

    // 3. Save hashed token into RefreshToken table
    await prisma.refreshToken.create({
      data: {
        userId,
        hashToken,
        expiresAt: getRefreshTokenExpiryDate(),
      },
    });

    // 4. Return raw refresh token for client cookie
    return refreshToken;
  },

  /**
   * Generate both access token and refresh token
   */
  async generateTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(payload.userId);

    return { accessToken, refreshToken };
  },

  /**
   * Validate refresh token against bcrypt hash in DB and return new rotated token pair
   */
  async refreshAccessToken(refreshTokenValue: string): Promise<TokenPair> {
    // 1. Verify the refresh token JWT
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(refreshTokenValue, REFRESH_TOKEN_SECRET) as {
        userId: string;
      };
    } catch {
      throw new ApiError(
        "Invalid or expired refresh token",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new ApiError("User not found", 401, "USER_NOT_FOUND");
    }

    // 3. Fetch active refresh tokens for this user
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        userId: user.id,
        revokedAt: null,
      },
    });

    // 4. Find matching token using bcrypt.compare
    let matchedToken = null;
    for (const tokenRecord of storedTokens) {
      const isMatch = await bcrypt.compare(
        refreshTokenValue,
        tokenRecord.hashToken,
      );
      if (isMatch) {
        matchedToken = tokenRecord;
        break;
      }
    }

    if (!matchedToken) {
      throw new ApiError(
        "Invalid or revoked refresh token",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    // 5. Check if expired
    if (matchedToken.expiresAt < new Date()) {
      await prisma.refreshToken.update({
        where: { id: matchedToken.id },
        data: { revokedAt: new Date() },
      });
      throw new ApiError("Refresh token expired", 401, "REFRESH_TOKEN_EXPIRED");
    }

    // 6. Revoke the old refresh token (refresh token rotation)
    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { revokedAt: new Date() },
    });

    // 7. Issue new token pair
    return this.generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username,
    });
  },

  /**
   * Revoke a refresh token on logout
   */
  async revokeRefreshToken(refreshTokenValue: string): Promise<void> {
    try {
      const decoded = jwt.verify(refreshTokenValue, REFRESH_TOKEN_SECRET) as {
        userId: string;
      };

      const storedTokens = await prisma.refreshToken.findMany({
        where: {
          userId: decoded.userId,
          revokedAt: null,
        },
      });

      for (const tokenRecord of storedTokens) {
        const isMatch = await bcrypt.compare(
          refreshTokenValue,
          tokenRecord.hashToken,
        );
        if (isMatch) {
          await prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revokedAt: new Date() },
          });
          break;
        }
      }
    } catch {
      // Ignore if token is already expired or invalid
    }
  },

  /**
   * Clean up expired or revoked refresh tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
      },
    });
  },
};
