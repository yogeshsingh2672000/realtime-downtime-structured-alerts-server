import { Router } from "express";
import swaggerUi from "swagger-ui-express";

// Minimal OpenAPI skeleton; can be extended later
const openapi = {
  openapi: "3.0.3",
  info: { title: "User Management API", version: "1.0.0" },
  servers: [{ url: "/" }],
  paths: {
    "/api/auth/register": { post: { summary: "Register user", responses: { "201": { description: "Created" } } } },
    "/api/auth/login": { post: { summary: "Login", responses: { "200": { description: "OK" } } } },
    "/api/auth/logout": { post: { summary: "Logout", responses: { "200": { description: "OK" } } } },
    "/api/auth/session": { get: { summary: "Session", responses: { "200": { description: "OK" } } } },
    "/api/auth/refresh": { post: { summary: "Refresh token", responses: { "200": { description: "OK" } } } },
    "/api/email/trigger": { post: { summary: "Trigger email", responses: { "200": { description: "OK" } } } },
    "/api/email/test": { get: { summary: "Test email", responses: { "200": { description: "OK" } } } },
  },
};

export const docsRouter = Router();
docsRouter.use("/spec", (_req, res) => res.json(openapi));
docsRouter.use("/ui", swaggerUi.serve, swaggerUi.setup(openapi));


