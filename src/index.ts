import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import cookieParser from "cookie-parser";
import pino from "pino";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// pino-http has CJS typings that don't play nicely with NodeNext ESM
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pinoHttp = require("pino-http");
import createError from "http-errors";

import { registerRoutes } from "./routes/index.js";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

// Health and readiness
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));
app.get("/readiness", (_req, res) => res.status(200).json({ ready: true }));
app.get("/version", (_req, res) => res.json({ version: process.env.npm_package_version }));

// API routes
registerRoutes(app);

// 404 handler
app.use((_req, _res, next) => next(createError(404, "not_found")));

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : "internal_error";
  res.status(status).json({ error: message });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  logger.info({ port }, "server_started");
});


