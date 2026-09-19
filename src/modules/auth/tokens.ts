import jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import type { AuthTokens } from "./auth.types.js";

interface TokenPayload {
  userId: string;
}

export function createTokens(
  userId: string,
): AuthTokens {
  const payload: TokenPayload = {
    userId,
  };

  const accessToken = jwt.sign(
    payload,
    env.jwtSecret,
    {
      expiresIn: "15m",
    },
  );

  const refreshToken = jwt.sign(
    payload,
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

export function verifyToken(
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

  return {
    userId: payload.userId,
  };
}
