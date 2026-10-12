import { randomInt } from "node:crypto";

import { createAuthUser } from "./auth.repository.js";

import {
  createTokens,
  verifyRefreshToken,
} from "./tokens.js";

import {
  findUserByPhone,
  findUserByWasalCode,
} from "../users/users.repository.js";

import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "./auth.types.js";

import { verifyPassword } from "./password.js";

/**
 * إنشاء رمز وصال من خمسة أرقام.
 * استخدام randomInt يوفر توليدًا عشوائيًا مناسبًا.
 * padStart يحافظ على الأصفار في بداية الرمز.
 */
function generateWasalCode(): string {
  return randomInt(0, 100000)
    .toString()
    .padStart(5, "0");
}

/**
 * البحث عن رمز غير مستخدم.
 * يبقى فحص UNIQUE في قاعدة البيانات ضروريًا
 * لمنع التكرار حتى لو حدث طلبان متزامنان.
 */
async function createUniqueWasalCode(): Promise<string> {
  for (let attempt = 0; attempt < 100; attempt++) {
    const wasalCode = generateWasalCode();

    const existingUser = await findUserByWasalCode(
      wasalCode,
    );

    if (!existingUser) {
      return wasalCode;
    }
  }

  throw new Error("WASAL_CODE_GENERATION_FAILED");
}

export async function register(
  input: RegisterInput,
): Promise<AuthResponse> {
  const displayName = input.displayName?.trim();

  if (!displayName) {
    throw new Error("DISPLAY_NAME_REQUIRED");
  }

  if (displayName.length > 80) {
    throw new Error("DISPLAY_NAME_TOO_LONG");
  }

  const wasalCode = await createUniqueWasalCode();

  const user = await createAuthUser(
    displayName,
    wasalCode,
  );

  const tokens = createTokens(user.id);

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
 * تسجيل الدخول للحسابات التي تستخدم الهاتف وكلمة المرور.
 * أبقينا هذا المسار متوافقًا مع الحسابات الحالية.
 */
export async function login(
  input: LoginInput,
): Promise<AuthResponse> {
  if (!input.phone || !input.password) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const user = await findUserByPhone(input.phone);

  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const validPassword = verifyPassword(
    input.password,
    user.passwordHash,
  );

  if (!validPassword) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const tokens = createTokens(user.id);

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
 * إصدار accessToken وrefreshToken جديدين.
 * يجب على العميل حفظ الرمزين المستلمين.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const payload = verifyRefreshToken(refreshToken);

  const tokens = createTokens(payload.userId);

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}
