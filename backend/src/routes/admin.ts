import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'PCP', 'Gerenciamento', 'Almoxarifado', 'Operador', 'Laboratorio', 'Qualidade']),
});

router.get('/users', authMiddleware, requireRole('Admin'), async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
  res.json(users);
});

router.post('/users', authMiddleware, requireRole('Admin'), async (req: AuthRequest, res: Response) => {
  const v = CreateUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { username: v.username } });
  if (existing) { res.status(400).json({ error: 'Nome de usuário já existe' }); return; }

  const passwordHash = await bcrypt.hash(v.password, 12);

  const user = await prisma.user.create({
    data: { username: v.username, passwordHash, name: v.name, email: v.email, role: v.role },
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true },
  });

  res.status(201).json({ success: true, user });
});

router.put('/users/:id', authMiddleware, requireRole('Admin'), async (req: AuthRequest, res: Response) => {
  const { role, is_active, password } = req.body;
  const data: Record<string, unknown> = { role, isActive: is_active };

  if (password) {
    data.passwordHash = await bcrypt.hash(password, 12);
    // Revoke all sessions when password changes
    await prisma.session.deleteMany({ where: { userId: req.params.id } });
  }

  // If deactivating user, revoke sessions
  if (is_active === false) {
    await prisma.session.deleteMany({ where: { userId: req.params.id } });
  }

  await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ success: true });
});

export default router;
