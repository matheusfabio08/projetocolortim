import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  const { username, password } = parsed.data;

  // Always hash to prevent timing attacks
  const user = await prisma.user.findFirst({
    where: { username, isActive: true },
  });

  const dummyHash = '$2a$12$invalidhashfortimingatk';
  const hashToVerify = user?.passwordHash ?? dummyHash;

  const isValid = await bcrypt.compare(password, hashToVerify);

  if (!user || !isValid) {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
    return;
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn } as any
  );

  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: { userId: user.id, token, expiresAt },
  });

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

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(req.user);
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    await prisma.userSession.deleteMany({ where: { token } });
  }
  res.json({ success: true });
});

export default router;
