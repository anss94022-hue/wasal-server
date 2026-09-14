import cors from "cors";
import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin:
        process.env.CORS_ORIGIN === "*"
          ? true
          : process.env.CORS_ORIGIN
    })
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "wasal-server"
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);

  return app;
}
