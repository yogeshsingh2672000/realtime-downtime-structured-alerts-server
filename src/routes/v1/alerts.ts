import { Router, Request, Response } from "express";
import { z } from "zod";

type AlertDestination = {
  id: string;
  email: string;
  llmProvider: string;
  model: string;
  createdAt: number;
};

// In-memory store keyed by sessionId
const globalAny = globalThis as any;
if (!globalAny.__alertsStore) {
  globalAny.__alertsStore = new Map<string, AlertDestination[]>();
}
const sessionIdToAlerts: Map<string, AlertDestination[]> = globalAny.__alertsStore;

function getSessionIdFromCookie(req: Request): string | null {
  const raw = req.cookies?.["session"];
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.sessionId as string;
  } catch {
    return null;
  }
}

function generateId(): string {
  return `alert_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

const createSchema = z.object({
  email: z.string().email(),
  llmProvider: z.string().min(1),
  model: z.string().min(1),
});

export const alertsRouter = Router();

// GET /api/alerts
alertsRouter.get("/", (req: Request, res: Response) => {
  const sessionId = getSessionIdFromCookie(req) ?? "default";
  const items = sessionIdToAlerts.get(sessionId) ?? [];
  return res.json({ items });
});

// POST /api/alerts
alertsRouter.post("/", (req: Request, res: Response) => {
  const sessionId = getSessionIdFromCookie(req) ?? "default";
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_body" });

  const newItem: AlertDestination = {
    id: generateId(),
    email: parsed.data.email,
    llmProvider: parsed.data.llmProvider,
    model: parsed.data.model,
    createdAt: Date.now(),
  };
  const existing = sessionIdToAlerts.get(sessionId) ?? [];
  sessionIdToAlerts.set(sessionId, [newItem, ...existing]);
  return res.status(201).json({ item: newItem });
});

// DELETE /api/alerts/:id
alertsRouter.delete("/:id", (req: Request, res: Response) => {
  const sessionId = getSessionIdFromCookie(req) ?? "default";
  const { id } = req.params;
  const existing = sessionIdToAlerts.get(sessionId) ?? [];
  const next = existing.filter((a) => a.id !== id);
  sessionIdToAlerts.set(sessionId, next);
  return res.json({ ok: true });
});


