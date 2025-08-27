import { Router } from "express";
import swaggerUi from "swagger-ui-express";

// Minimal OpenAPI skeleton; can be extended later
const openapi = {
  openapi: "3.0.3",
  info: { title: "Realtime Downtime Alerts API", version: "1.0.0" },
  servers: [{ url: "/" }],
  paths: {
    "/api/alerts": {
      get: { summary: "List alerts", responses: { "200": { description: "OK" } } },
      post: { summary: "Create alert", responses: { "201": { description: "Created" } } },
    },
    "/api/alerts/{id}": {
      delete: { summary: "Delete alert", responses: { "200": { description: "OK" } } },
    },
    "/api/auth/login": { post: { summary: "Login", responses: { "200": { description: "OK" } } } },
    "/api/auth/logout": { post: { summary: "Logout", responses: { "200": { description: "OK" } } } },
    "/api/auth/session": { get: { summary: "Session", responses: { "200": { description: "OK" } } } },
  },
};

export const docsRouter = Router();
docsRouter.use("/spec", (_req, res) => res.json(openapi));
docsRouter.use("/ui", swaggerUi.serve, swaggerUi.setup(openapi));


