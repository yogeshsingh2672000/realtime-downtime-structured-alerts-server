import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.js';
import { getSessionByRefreshToken } from '../db/repositories/sessions.js';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        username: string;
      };
    }
  }
}

/**
 * Authentication middleware that validates JWT access tokens
 * and adds user information to the request object
 */
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const authHeader = req.get('Authorization');
    const accessToken = extractTokenFromHeader(authHeader);

    if (!accessToken) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Access token required'
      });
    }

    // Verify the access token
    const payload = verifyAccessToken(accessToken);
    if (!payload) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid or expired access token'
      });
    }

    // Add user information to request object
    req.user = {
      id: payload.userId,
      email: payload.email,
      username: payload.username || ''
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authentication failed'
    });
  }
}

/**
 * Optional authentication middleware that doesn't fail if no token is provided
 * Useful for routes that can work with or without authentication
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.get('Authorization');
    const accessToken = extractTokenFromHeader(authHeader);

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        req.user = {
          id: payload.userId,
          email: payload.email,
          username: payload.username || ''
        };
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue even if authentication fails
  }
}

/**
 * Middleware to check if user is admin
 * Must be used after authenticateToken middleware
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authentication required'
    });
  }

  // Note: You'll need to fetch the user from database to check admin status
  // For now, we'll assume all authenticated users are admin
  // You can enhance this by adding a database lookup
  next();
}
