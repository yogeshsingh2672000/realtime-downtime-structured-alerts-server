import { Router, Request, Response } from "express";
import { z } from "zod";
import { createAuth, getAuthByEmail, getAuthByUsername, getAuthByPhoneNumber, incrementFailedAttempts, resetFailedAttempts, updateLastLogin, lockAccount } from "../../db/repositories/auth.js";
import { createSession, deleteSessionByRefreshToken, deleteAllUserSessions, getSessionByRefreshToken, updateSession } from "../../db/repositories/sessions.js";
import { generateTokenPair, verifyAccessToken, verifyRefreshToken, extractTokenFromHeader } from "../../utils/jwt.js";
import { hashPassword, comparePassword, validatePasswordStrength } from "../../utils/password.js";

export const authRouter = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username must be less than 50 characters").optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

// Helper function to get user agent and IP
function getUserInfo(req: Request) {
  return {
    userAgent: req.get('User-Agent') || null,
    ipAddress: req.ip || req.connection.remoteAddress || null,
  };
}

// Helper function to check if account is locked
function isAccountLocked(lockedUntil: string | null): boolean {
  if (!lockedUntil) return false;
  return new Date(lockedUntil) > new Date();
}

// POST /api/auth/register
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_body",
        details: parsed.error.issues
      });
    }

    const { email, username, password, phone_number } = parsed.data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: "weak_password",
        details: passwordValidation.errors
      });
    }

    // Check if email already exists
    const existingEmail = await getAuthByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        error: "email_exists",
        message: "Email address is already registered"
      });
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await getAuthByUsername(username);
      if (existingUsername) {
        return res.status(409).json({
          error: "username_exists",
          message: "Username is already taken"
        });
      }
    }

    // Check if phone number already exists
    const existingPhone = await getAuthByPhoneNumber(phone_number);
    if (existingPhone) {
      return res.status(409).json({
        error: "phone_exists",
        message: "Phone number is already registered"
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create auth record
    const authRecord = await createAuth({
      email,
      username: username || null,
      password_hash,
      phone_number,
      email_verified: false,
      phone_verified: false,
      failed_attempts: 0,
      last_login_at: null,
      locked_until: null,
    });

    // Generate tokens
    const tokens = generateTokenPair({
      userId: authRecord.id,
      email: authRecord.email,
      username: authRecord.username || undefined,
    });

    // Create session
    const { userAgent, ipAddress } = getUserInfo(req);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await createSession({
      user_id: authRecord.id,
      refresh_token: tokens.refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: expiresAt.toISOString(),
    });

    // Set HTTP-only cookie
    res.cookie('session', JSON.stringify({
      sessionId: tokens.refreshToken,
      user: {
        id: authRecord.id,
        email: authRecord.email,
        username: authRecord.username,
      }
    }), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return res.status(201).json({
      ok: true,
      user: {
        id: authRecord.id,
        email: authRecord.email,
        username: authRecord.username,
      },
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      message: "Registration successful"
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "An internal error occurred during registration"
    });
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_body",
        details: parsed.error.issues
      });
    }

    const { email, password } = parsed.data;

    // Get user by email
    const authRecord = await getAuthByEmail(email);
    if (!authRecord) {
      return res.status(401).json({
        error: "invalid_credentials",
        message: "Invalid email or password"
      });
    }

    // Check if account is locked
    if (isAccountLocked(authRecord.locked_until)) {
      return res.status(423).json({
        error: "account_locked",
        message: "Account is temporarily locked due to too many failed attempts"
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, authRecord.password_hash);
    if (!isValidPassword) {
      // Increment failed attempts
      const updatedAuth = await incrementFailedAttempts(authRecord.id);
      
      // Lock account if too many failed attempts (5 attempts)
      if (updatedAuth.failed_attempts && updatedAuth.failed_attempts >= 5) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + 30); // Lock for 30 minutes
        await lockAccount(authRecord.id, lockUntil);
      }

      return res.status(401).json({
        error: "invalid_credentials",
        message: "Invalid email or password"
      });
    }

    // Reset failed attempts on successful login
    await resetFailedAttempts(authRecord.id);
    await updateLastLogin(authRecord.id);

    // Generate tokens
    const tokens = generateTokenPair({
      userId: authRecord.id,
      email: authRecord.email,
      username: authRecord.username || undefined,
    });

    // Create session
    const { userAgent, ipAddress } = getUserInfo(req);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await createSession({
      user_id: authRecord.id,
      refresh_token: tokens.refreshToken,
      user_agent: userAgent,
      ip_address: ipAddress,
      expires_at: expiresAt.toISOString(),
    });

    // Set HTTP-only cookie
    res.cookie('session', JSON.stringify({
      sessionId: tokens.refreshToken,
      user: {
        id: authRecord.id,
        email: authRecord.email,
        username: authRecord.username,
      }
    }), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return res.status(200).json({
    ok: true, 
      user: {
        id: authRecord.id,
        email: authRecord.email,
        username: authRecord.username,
      },
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      message: "Login successful"
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "An internal error occurred during login"
    });
  }
});

// POST /api/auth/logout
authRouter.post("/logout", async (req: Request, res: Response) => {
  try {
    const sessionCookie = req.cookies?.session;
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie);
        if (sessionData.sessionId) {
          await deleteSessionByRefreshToken(sessionData.sessionId);
        }
      } catch (error) {
        // Ignore cookie parsing errors
      }
    }

    // Clear the session cookie
    res.clearCookie('session', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });

    return res.status(200).json({
    ok: true, 
    message: "Logout successful"
  });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "An internal error occurred during logout"
    });
  }
});

// GET /api/auth/session
authRouter.get("/session", async (req: Request, res: Response) => {
  try {
    const authHeader = req.get('Authorization');
    const accessToken = extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return res.status(200).json({
        authenticated: false,
        user: null
      });
    }

    return res.status(200).json({
    authenticated: true, 
      user: {
        id: payload.userId,
        email: payload.email,
        username: payload.username,
      }
    });

  } catch (error) {
    console.error("Session check error:", error);
    return res.status(200).json({
      authenticated: false,
      user: null
    });
  }
});

// POST /api/auth/refresh
authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_body",
        details: parsed.error.issues
      });
    }

    const { refresh_token } = parsed.data;

    // Verify refresh token
    const payload = verifyRefreshToken(refresh_token);
    if (!payload) {
      return res.status(401).json({
        error: "invalid_token",
        message: "Invalid refresh token"
      });
    }

    // Check if session exists in database
    const session = await getSessionByRefreshToken(refresh_token);
    if (!session || !session.user_id) {
      return res.status(401).json({
        error: "invalid_session",
        message: "Session not found"
      });
    }

    // Check if session is expired
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      await deleteSessionByRefreshToken(refresh_token);
      return res.status(401).json({
        error: "expired_session",
        message: "Session has expired"
      });
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    });

    // Update session with new refresh token
    await updateSession(session.id, {
      refresh_token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    // Update cookie
    res.cookie('session', JSON.stringify({
      sessionId: tokens.refreshToken,
      user: {
        id: payload.userId,
        email: payload.email,
        username: payload.username,
      }
    }), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });

    return res.status(200).json({
      ok: true,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      message: "Token refreshed successfully"
    });

  } catch (error) {
    console.error("Token refresh error:", error);
    return res.status(500).json({
      error: "internal_error",
      message: "An internal error occurred during token refresh"
    });
  }
});


