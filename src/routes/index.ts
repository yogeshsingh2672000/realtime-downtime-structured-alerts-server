import { Express } from "express";
import { authRouter } from "./v1/auth.js";
import { alertsRouter } from "./v1/alerts.js";
import { docsRouter } from "./v1/docs.js";
import { usersRouter } from "./v1/users.js";
import { modelsRouter } from "./v1/models.js";
import { userRouter } from "./v1/user.js";
import { userModelMapperRouter } from "./v1/userModelMapper.js";

export function registerRoutes(app: Express) {
  app.use("/api/auth", authRouter);
  app.use("/api/alerts", alertsRouter);
  app.use("/api/docs", docsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/models", modelsRouter);
  app.use("/api/user", userRouter);
  app.use("/api/user-model-mapper", userModelMapperRouter);
}


