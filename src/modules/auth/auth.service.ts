import { randomInt } from "node:crypto";

import { createAuthUser } from "./auth.repository.js";

import {
  createTokens,
  verifyRefreshToken,
} from "./tokens.js";

import {
  findUserByPhone,
  findUserByUsername,
  findUserByWasalCode,
} from "../users/users.repository.js";

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "./auth.types.js";

import { verifyPassword } from "./password.js";

function generateWasalCode(): string {
  return String(
    randomInt(10000, 100000)
  );
}

async function createUniqueWasalCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const wasalCode = generateWasalCode();

    const existingUser =
      await findUserByWasalCode(
        wasalCode
      );

    if (!existingUser) {
      return wasalCode;
    }
  }

  throw new Error(
    "WASAL_CODE_GENERATION_FAILED"
  );
}

export async function register(
  input: RegisterInput,
): Promise<AuthResponse> {
  const displayName =
    input.displayName?.trim();

  if (!displayName) {
    throw new Error(
      "DISPLAY_NAME_REQUIRED"
    );
  }

  const wasalCode =
    await createUniqueWasalCode();

  const user =
    await createAuthUser(
      displayName,
      wasalCode,
    );

  const tokens =
    createTokens(user.id);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      username: user.username,
      wasalCode: user.wasalCode,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    tokens,
  };
}

/**
 * Login is kept for compatibility
 * with existing accounts that still use
 * phone + password.
 *
 * New Wasal accounts are registered
 * using displayName only and use the
 * issued accessToken/refreshToken.
 */
export async function login(
  input: LoginInput,
): Promise<AuthResponse> {
  if (!input.phone || !input.password) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  const user =
    await findUserByPhone(input.phone);

  if (!user || !user.passwordHash) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  const validPassword =
    verifyPassword(
      input.password,
      user.passwordHash,
    );

  if (!validPassword) {
    throw new Error(
      "INVALID_CREDENTIALS"
    );
  }

  const tokens =
    createTokens(user.id);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      username: user.username,
      wasalCode: user.wasalCode,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    tokens,
  };
}

/**
 * Creates a new short-lived access token
 * from a valid refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{
  accessToken: string;
}> {
  const payload =
    verifyRefreshToken(
      refreshToken,
    );

  const tokens =
    createTokens(
      payload.userId,
    );

  return {
    accessToken:
      tokens.accessToken,
  };
}
