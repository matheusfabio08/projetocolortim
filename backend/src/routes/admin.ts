import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);
router.use(requireRole('Admin'));

const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
});

router.get('/users', async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  res.json(users);
});

router.post('/users', async (req: AuthRequest, res: Response) => {
  const v = CreateUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { username: v.username } });
  if (existing) { res.status(400).json({ error: 'Nome de usuário já existe' }); return; }

  const passwordHash = await bcrypt.hash(v.password, 12);
  const user = await prisma.user.create({
    data: { username: v.username, passwordHash, name: v.name, email: v.email, role: v.role as any },
  });

  res.status(201).json({ success: true, id: user.id });
});

router.put('/users/:id', async (req, res: Response) => {
  const { role, is_active, password } = req.body;
  const data: any = {};
  if (role) data.role = role;
  if (typeof is_active === 'boolean') data.isActive = is_active;
  if (password) data.passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ success: true });
});

router.delete('/users/:id', async (req, res: Response) => {
  await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.json({ success: true });
});

export default router;
