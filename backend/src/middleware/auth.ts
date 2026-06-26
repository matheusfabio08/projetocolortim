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
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET não configurado');

    const payload = jwt.verify(token, secret) as any;

    // Verifica sessão ativa no banco
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, username: true, name: true, email: true, role: true, isActive: true } } },
    });

    if (!session || !session.user.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }

    req.user = {
      id: session.user.id,
      username: session.user.username,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
};
