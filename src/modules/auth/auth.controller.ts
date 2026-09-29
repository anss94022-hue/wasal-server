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
      displayName,
    } = req.body;

    if (
      typeof displayName !== "string" ||
      !displayName.trim()
    ) {
      res.status(400).json({
        success: false,
        error: "DISPLAY_NAME_REQUIRED",
      });
      return;
    }

    const result = await register({
      displayName: displayName.trim(),
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
      "DISPLAY_NAME_REQUIRED"
    ) {
      res.status(400).json({
        success: false,
        error: message,
      });
      return;
    }

    if (
      message ===
      "WASAL_CODE_GENERATION_FAILED"
    ) {
      res.status(503).json({
        success: false,
        error: message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
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

    if (
      typeof phone !== "string" ||
      typeof password !== "string" ||
      !phone ||
      !password
    ) {
      res.status(400).json({
        success: false,
        error: "PHONE_PASSWORD_REQUIRED",
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
        error: "INVALID_CREDENTIALS",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "INTERNAL_SERVER_ERROR",
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
      typeof refreshToken !== "string" ||
      !refreshToken
    ) {
      res.status(400).json({
        success: false,
        error: "REFRESH_TOKEN_REQUIRED",
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
  } catch {
    res.status(401).json({
      success: false,
      error:
        "INVALID_OR_EXPIRED_REFRESH_TOKEN",
    });
  }
}
