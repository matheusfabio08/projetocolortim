import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '20', 10),
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  skipSuccessfulRequests: true,
});

router.post('/login', loginLimiter, async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  // Tempo constante para prevenir enumeração de usuários
  const DUMMY_HASH = '$2a$12$dummyhashfornonexistentuser000000000000000000000000000';

  const user = await prisma.user.findUnique({ where: { username } }).catch(() => null);

  const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!user || !isValid || !user.isActive) {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
    return;
  }

  // Limpa sessões expiradas do usuário
  await prisma.userSession.deleteMany({
    where: { userId: user.id, expiresAt: { lt: new Date() } },
  });

  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8h

  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      token: require('crypto').randomBytes(32).toString('hex'),
      expiresAt,
    },
  });

  const token = jwt.sign(
    { userId: user.id, sessionId: session.id },
    process.env.JWT_SECRET!,
    { expiresIn: '8h' }
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

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json(req.user);
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const decoded = jwt.decode(token) as { sessionId?: string } | null;
    if (decoded?.sessionId) {
      await prisma.userSession.deleteMany({ where: { id: decoded.sessionId } }).catch(() => {});
    }
  }
  res.json({ success: true });
});

export default router;
