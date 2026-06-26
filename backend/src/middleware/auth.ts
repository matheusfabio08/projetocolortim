import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.headers.authorization?.split(' ')[1] ||
    (req.headers['x-session-token'] as string);

  if (!token) {
    res.status(401).json({ error: 'Não autorizado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      sessionId: string;
    };

    // Validate session still exists in DB (allows server-side logout)
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: 'Sessão expirada ou inválida' });
      return;
    }

    if (!session.user.isActive) {
      res.status(403).json({ error: 'Usuário desativado' });
      return;
    }

    req.user = {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      isActive: session.user.isActive,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Permissão insuficiente' });
      return;
    }
    next();
  };
};
