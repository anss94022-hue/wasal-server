import {
  Request,
  Response,
} from "express";

import {
  register,
  login,
  refreshAccessToken,
} from "./auth.service.js";

export async function registerController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      phone,
      username,
      displayName,
      password,
    } = req.body;

    if (
      !phone ||
      !displayName ||
      !password
    ) {
      res.status(400).json({
        success: false,
        error:
          "PHONE_DISPLAY_NAME_PASSWORD_REQUIRED",
      });
      return;
    }

    const result = await register({
      phone,
      username,
      displayName,
      password,
    });

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
        "PHONE_ALREADY_REGISTERED" ||
      message ===
        "USERNAME_ALREADY_TAKEN"
    ) {
      res.status(409).json({
        success: false,
        error: message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error:
        "INTERNAL_SERVER_ERROR",
    });
  }
}

export async function loginController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      phone,
      password,
    } = req.body;

    if (!phone || !password) {
      res.status(400).json({
        success: false,
        error:
          "PHONE_PASSWORD_REQUIRED",
      });
      return;
    }

    const result = await login({
      phone,
      password,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
      "INVALID_CREDENTIALS"
    ) {
      res.status(401).json({
        success: false,
        error:
          "INVALID_CREDENTIALS",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error:
        "INTERNAL_SERVER_ERROR",
    });
  }
}

export async function refreshController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const {
      refreshToken,
    } = req.body;

    if (
      !refreshToken ||
      typeof refreshToken !==
        "string"
    ) {
      res.status(400).json({
        success: false,
        error:
          "REFRESH_TOKEN_REQUIRED",
      });
      return;
    }

    const result =
      await refreshAccessToken(
        refreshToken,
      );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    if (
      message ===
        "INVALID_REFRESH_TOKEN" ||
      message ===
        "INVALID_TOKEN" ||
      message ===
        "jwt expired" ||
      message ===
        "jwt malformed" ||
      message ===
        "invalid signature"
    ) {
      res.status(401).json({
        success: false,
        error:
          "INVALID_OR_EXPIRED_REFRESH_TOKEN",
      });
      return;
    }

    res.status(401).json({
      success: false,
      error:
        "INVALID_OR_EXPIRED_REFRESH_TOKEN",
    });
  }
}
