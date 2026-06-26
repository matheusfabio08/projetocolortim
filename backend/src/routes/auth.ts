import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  // Constant-time response to prevent username enumeration
  const user = await prisma.user.findUnique({ where: { username } });
  const fakeHash = '$2b$12$invalidhashinvalidhashinvalidhashinvaliA';
  const hashToCompare = user?.passwordHash ?? fakeHash;

  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!user || !isValid || !user.isActive) {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
    return;
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json(req.user);
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1] ||
    (req.headers['x-session-token'] as string);

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  res.json({ success: true });
});

export default router;
