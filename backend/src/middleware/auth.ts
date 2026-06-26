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
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Valida sessão no banco (invalida se logout foi feito)
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

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }
    next();
  };
