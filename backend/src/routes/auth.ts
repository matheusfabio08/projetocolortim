import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { addDays } from 'date-fns';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX) || 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });

    // Constant-time check to prevent user enumeration
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.xxxxxxxxxxxxxxx';
    const hashToCheck = user?.passwordHash || dummyHash;
    const isValid = await bcrypt.compare(password, hashToCheck);

    if (!user || !isValid || !user.isActive) {
      res.status(401).json({ error: 'Usuário ou senha inválidos' });
      return;
    }

    const expiresAt = addDays(new Date(), 7);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        expiresAt,
      },
    });

    const token = signToken({ userId: user.id, sessionId: session.id });

    // Update the session token to be the JWT
    await prisma.session.update({
      where: { id: session.id },
      data: { token },
    });

    res.cookie('colortim_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  res.json(req.user);
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (req.sessionId) {
      await prisma.session.delete({ where: { id: req.sessionId } });
    }
    res.clearCookie('colortim_token');
    res.json({ success: true });
  } catch {
    res.json({ success: true });
  }
});

export default router;
