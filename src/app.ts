import cors from "cors";
import express from "express";

import { env } from "./config/env.js";

import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import conversationsRoutes from "./modules/conversations/conversations.routes.js";
import messagesRoutes from "./modules/messages/messages.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";

import { listCallHistory } from "./modules/calls/calls.history.js";

import { requireAuth } from "./middleware/auth.js";
import type { AuthRequest } from "./middleware/auth.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin:
        env.corsOrigin === "*"
          ? true
          : env.corsOrigin,
    }),
  );

  app.use(
    express.json({
      limit: "1mb",
    }),
  );

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "wasal-server",
    });
  });

  app.use(
    "/api/auth",
    authRoutes,
  );

  app.use(
    "/api/users",
    requireAuth,
    usersRoutes,
  );

  app.use(
    "/api/conversations",
    requireAuth,
    conversationsRoutes,
  );

  app.use(
    "/api/messages",
    requireAuth,
    messagesRoutes,
  );

  app.use(
    "/api/calls",
    requireAuth,
    async (req: AuthRequest, res) => {
      // استجابة ثابتة كانت تُخفي سجل المكالمات الحقيقي.
      try {
        const calls = await listCallHistory(String(req.userId));

        res.status(200).json({
          success: true,
          calls,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: "CALL_HISTORY_FAILED",
          message: (error as Error).message,
        });
      }
    },
  );

  app.use(
    "/api/media",
    mediaRoutes,
  );

  return app;
}
