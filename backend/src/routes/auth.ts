import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, 'Usuário obrigatório'),
  password: z.string().min(1, 'Senha obrigatória'),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.errors[0].message });
    }
    const { username, password } = result.data;

    // Always find user (constant time response to prevent enumeration)
    const user = await prisma.user.findUnique({ where: { username } });
    
    // Always run bcrypt compare (prevents timing attacks)
    const dummyHash = '$2b$12$invalidhashforlengthpaddingtoprevtimingattacks12345';
    const hashToCompare = user?.passwordHash ?? dummyHash;
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid || !user.isActive) {
      return res.status(401).json({ error: 'Usuário ou senha inválidos' });
    }

    const jwtSecret = process.env.JWT_SECRET!;
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn } as any
    );

    // Persist session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Erro no login' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  return res.json(req.user);
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.slice(7);
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no logout' });
  }
});

export default router;
