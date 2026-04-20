import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Support token via query param as a fallback for browser navigations
  // (e.g. anchor-click downloads) that cannot send Authorization headers.
  let token: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication token missing'));
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as { id: string; role: string };
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message, 'Token received:', token);
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const userRole = req.user.role.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      return next(new ApiError(403, 'Access denied: insufficient permissions'));
    }

    next();
  };
};
