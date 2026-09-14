import { createAuthUser } from "./auth.repository.js";
import { hashPassword } from "./password.js";
import { createTokens } from "./tokens.js";
import {
  findUserByPhone,
  findUserByUsername
} from "../users/users.repository.js";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput
} from "./auth.types.js";
import { verifyPassword } from "./password.js";

export async function register(
  input: RegisterInput
): Promise<AuthResponse> {
  const existingPhone = await findUserByPhone(input.phone);

  if (existingPhone) {
    throw new Error("PHONE_ALREADY_REGISTERED");
  }

  if (input.username) {
    const existingUsername = await findUserByUsername(input.username);

    if (existingUsername) {
      throw new Error("USERNAME_ALREADY_TAKEN");
    }
  }

  const passwordHash = hashPassword(input.password);

  const user = await createAuthUser(
    input.phone,
    input.username ?? null,
    input.displayName,
    passwordHash
  );

  const tokens = createTokens(user.id);

  return {
    user: {
      id: user.id,
      phone: user.phone,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    },
    tokens
  };
}

export async function login(
  input: LoginInput
): Promise<AuthResponse> {
  const user = await findUserByPhone(input.phone);

  if (!user || !user.passwordHash) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const validPassword = verifyPassword(
    input.password,
    user.passwordHash
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
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    },
    tokens
  };
}
