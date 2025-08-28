import { Express } from "express";
import { authRouter } from "./v1/auth.js";
import { alertsRouter } from "./v1/alerts.js";
import { docsRouter } from "./v1/docs.js";
import { usersRouter } from "./v1/users.js";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/docs", docsRouter);
  app.use("/api/users", usersRouter);
}


