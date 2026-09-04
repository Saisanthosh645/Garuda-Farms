import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminJwtPayload {
  adminId: string;
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

export const getJwtSecret = (): string => {
  return process.env.JWT_SECRET || 'garuda-farms-production-jwt-secret-key-2026';
};

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Check cookies if available
    if (!token && req.cookies && req.cookies.garuda_admin_token) {
      token = req.cookies.garuda_admin_token;
    }

    if (!token) {
      res.status(401).json({
        ok: false,
        error: 'Unauthorized. Admin authentication token is required.',
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, getJwtSecret()) as AdminJwtPayload;

    if (!decoded || decoded.role !== 'admin') {
      res.status(403).json({
        ok: false,
        error: 'Forbidden. Access restricted to the single Garuda Farms admin account.',
      });
      return;
    }

    req.admin = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      ok: false,
      error: 'Invalid or expired authentication token. Please log in again.',
    });
  }
}
