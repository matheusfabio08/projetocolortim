import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  skipSuccessfulRequests: true,
});

router.post('/login', loginLimiter, async (req, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  // Always run bcrypt to prevent timing attacks
  const dummyHash = '$2a$12$dummyhashfortimingatttackprevention00000000000000000000';

  const user = await prisma.user.findUnique({ where: { username } });

  const hashToVerify = user?.passwordHash ?? dummyHash;
  const isValid = await bcrypt.compare(password, hashToVerify);

  if (!user || !isValid || !user.isActive) {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
    return;
  }

  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

  // Create session in DB
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  const token = jwt.sign(
    { userId: user.id, sessionId: session.id },
    secret,
    { expiresIn } as jwt.SignOptions
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const secret = process.env.JWT_SECRET!;
      const payload = jwt.verify(token, secret) as { sessionId: string };
      await prisma.session.delete({ where: { id: payload.sessionId } });
    } catch {}
  }
  res.json({ success: true });
});

export default router;
