import { Router } from "express";
import { z } from "zod";

export const authRouter = Router();

// POST /api/auth/login — issue session cookie with mock user
authRouter.post("/login", (_req, res) => {
  const sessionId = `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  const mockUser = {
    id: "user_mock_google_1",
    name: "Mock Google User",
    email: "mock.user@gmail.com",
    provider: "google",
  };
  res
    .cookie("session", JSON.stringify({ sessionId, user: mockUser }), {
      httpOnly: false, // disable for testing purposes
      sameSite: "lax",
      secure: false, // disable for testing purposes
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    .json({ ok: true, user: mockUser });
});

// POST /api/auth/logout — clear session cookie
authRouter.post("/logout", (_req, res) => {
  res
    .cookie("session", "", {
      httpOnly: false, // disable for testing purposes
      sameSite: "lax",
      secure: false, // disable for testing purposes
      path: "/",
      maxAge: 0,
    })
    .json({ ok: true });
});

// GET /api/auth/session — read session cookie
authRouter.get("/session", (req, res) => {
  const raw = req.cookies?.["session"];
  if (!raw) return res.json({ authenticated: false, user: null });
  try {
    const parsed = JSON.parse(raw);
    return res.json({ authenticated: true, user: parsed.user });
  } catch {
    return res.json({ authenticated: false, user: null });
  }
});


