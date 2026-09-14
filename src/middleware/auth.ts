import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../modules/auth/tokens.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    res.status(401).json({
      error: "AUTH_REQUIRED"
    });
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();

  try {
    const payload = verifyToken(token);

    req.userId = payload.userId;

    next();
  } catch {
    res.status(401).json({
      error: "INVALID_OR_EXPIRED_TOKEN"
    });
  }
}
