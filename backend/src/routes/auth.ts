import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
  skipSuccessfulRequests: true,
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  // Busca usuário (tempo constante para evitar enumeração)
  const user = await prisma.user.findUnique({ where: { username } });
  const dummyHash = '$2a$12$invalido';
  const hashToCheck = user?.passwordHash ?? dummyHash;
  const isValid = await bcrypt.compare(password, hashToCheck);

  if (!user || !user.isActive || !isValid) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  const token = jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn } as any);

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);

  await prisma.session.create({
    data: { userId: user.id, token, expiresAt },
  });

  return res.json({
    token,
    user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role },
  });
});

authRouter.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  return res.json(req.user);
});

authRouter.post('/logout', authMiddleware, async (req: AuthRequest, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }
  return res.json({ success: true });
});
