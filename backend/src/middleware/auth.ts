import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

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
): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ error: 'Não autorizado' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    const payload = jwt.verify(token, secret) as { userId: string; sessionId: string };

    // Verify session still exists in DB (allows logout/revocation)
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
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
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autorizado' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado para este perfil' });
      return;
    }
    next();
  };
};
