import { Router } from "express";

export const authRouter = Router();

// Hardcoded user for simplicity
const HARDCODED_USER = {
  id: "user_mock_google_1",
  name: "Mock Google User",
  email: "mock.user@gmail.com",
  provider: "google",
};

// POST /api/auth/login — simple login response
authRouter.post("/login", (_req, res) => {
  res.json({ 
    ok: true, 
    user: HARDCODED_USER,
    message: "Login successful - using hardcoded authentication"
  });
});

// POST /api/auth/logout — simple logout response
authRouter.post("/logout", (_req, res) => {
  res.json({ 
    ok: true, 
    message: "Logout successful"
  });
});

// GET /api/auth/session — always return authenticated user
authRouter.get("/session", (_req, res) => {
  res.json({ 
    authenticated: true, 
    user: HARDCODED_USER,
    message: "Using hardcoded authentication"
  });
});


