import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import type { AuthTokens } from "./auth.types.js";

interface TokenPayload {
  userId: string;
  type?: "access" | "refresh";
}

export function createTokens(
  userId: string,
): AuthTokens {
  const accessToken = jwt.sign(
    {
      userId,
      type: "access",
    },
    env.jwtSecret,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    {
      userId,
      type: "refresh",
    },
    env.jwtSecret,
    {
      expiresIn: "30d",
    },
  );

  return {
    accessToken,
    refreshToken,
  };
}

function parseTokenPayload(
  token: string,
): TokenPayload {
  const payload = jwt.verify(
    token,
    env.jwtSecret,
  );

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.userId !== "string" ||
    payload.userId.length === 0
  ) {
    throw new Error("INVALID_TOKEN");
  }

  const type =
    "type" in payload &&
    (payload.type === "access" ||
      payload.type === "refresh")
      ? payload.type
      : undefined;

  return {
    userId: payload.userId,
    type,
  };
}

/**
 * Used by protected HTTP routes and Socket.IO.
 *
 * New access tokens must have type="access".
 * Old tokens without a type are still accepted
 * so existing sessions are not immediately broken.
 */
export function verifyToken(
  token: string,
): { userId: string } {
  const payload =
    parseTokenPayload(token);

  if (payload.type === "refresh") {
    throw new Error("INVALID_ACCESS_TOKEN");
  }

  return {
    userId: payload.userId,
  };
}

/**
 * Used only by /auth/refresh.
 */
export function verifyRefreshToken(
  token: string,
): { userId: string } {
  const payload =
    parseTokenPayload(token);

  if (payload.type === "access") {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  return {
    userId: payload.userId,
  };
}
