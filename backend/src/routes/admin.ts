import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

const createUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
});

router.get('/users', authMiddleware, requireRole('Admin'), async (_req, res): Promise<void> => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  res.json(users);
});

router.post('/users', authMiddleware, requireRole('Admin'), async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = createUserSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { username: validated.username } });
    if (existing) { res.status(400).json({ error: 'Nome de usuário já existe' }); return; }

    const passwordHash = await bcrypt.hash(validated.password, 12);
    const user = await prisma.user.create({
      data: { username: validated.username, passwordHash, name: validated.name, email: validated.email, role: validated.role as any },
    });
    res.status(201).json({ success: true, id: user.id });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.put('/users/:id', authMiddleware, requireRole('Admin'), async (_req, res): Promise<void> => {
  const { id } = _req.params;
  const { role, is_active, name, email } = _req.body;
  await prisma.user.update({ where: { id }, data: { role, isActive: is_active, name, email } });
  res.json({ success: true });
});

router.put('/users/:id/password', authMiddleware, requireRole('Admin'), async (req, res): Promise<void> => {
  const { password } = req.body;
  if (!password || password.length < 6) { res.status(400).json({ error: 'Senha deve ter no mínimo 6 caracteres' }); return; }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });
  // Invalidate all sessions
  await prisma.session.deleteMany({ where: { userId: req.params.id } });
  res.json({ success: true });
});

export default router;
