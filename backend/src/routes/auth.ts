import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/login', async (req, res): Promise<void> => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });

    // Constant-time response to prevent user enumeration
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxxxxx';
    const hashToCheck = user?.passwordHash ?? dummyHash;
    const isValid = await bcrypt.compare(password, hashToCheck);

    if (!user || !isValid || !user.isActive) {
      res.status(401).json({ error: 'Usuário ou senha inválidos' });
      return;
    }

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Clean up old sessions for this user (keep last 5)
    const oldSessions = await prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: 5,
    });
    if (oldSessions.length > 0) {
      await prisma.session.deleteMany({
        where: { id: { in: oldSessions.map((s) => s.id) } },
      });
    }

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
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  res.json(req.user);
});

export default router;
