import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(['Admin', 'PCP', 'Gerenciamento', 'Almoxarifado', 'Operador', 'Laboratorio', 'Qualidade']),
});

router.use(authMiddleware, requireRole('Admin'));

router.get('/users', async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.post('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  const v = CreateUserSchema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  const existing = await prisma.user.findUnique({ where: { username: d.username } });
  if (existing) { res.status(400).json({ error: 'Nome de usuário já existe' }); return; }

  const passwordHash = await bcrypt.hash(d.password, 12);
  const user = await prisma.user.create({
    data: { username: d.username, passwordHash, name: d.name, email: d.email, role: d.role },
    select: { id: true, username: true, name: true, email: true, role: true },
  });
  res.status(201).json(user);
});

router.put('/users/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { role, is_active, password } = req.body;
  const updateData: Record<string, unknown> = {};
  if (role !== undefined) updateData.role = role;
  if (is_active !== undefined) updateData.isActive = is_active;
  if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.update({ where: { id: req.params.id }, data: updateData });
  res.json({ success: true, user });
});

export default router;
