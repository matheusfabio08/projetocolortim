import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { username, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });

    // Resposta constante para evitar enumeração de usuários
    const invalid = () => res.status(401).json({ error: 'Usuário ou senha inválidos' });

    if (!user || !user.isActive) {
      // Still compare to prevent timing attacks
      await bcrypt.compare(password, '$2b$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXX');
      invalid(); return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { invalid(); return; }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    await prisma.session.create({
      data: { userId: user.id, token, expiresAt },
    });

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    console.error(e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  const token = req.headers.authorization!.slice(7);
  await prisma.session.deleteMany({ where: { token } });
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json(req.user);
});

export default router;
