import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

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

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.substring(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET não configurado");

    const payload = jwt.verify(token, secret) as { userId: string; sessionId: string };

    // Verify session still exists in DB (allows forced logout)
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId, token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Sessão expirada ou inválida" });
    }

    if (!session.user.isActive) {
      return res.status(401).json({ error: "Usuário desativado" });
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
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    next();
  };
};
