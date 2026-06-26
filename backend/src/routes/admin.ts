import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(authMiddleware, requireRole('Admin'));

const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string(),
});

adminRouter.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(users);
});

adminRouter.post('/users', async (req: AuthRequest, res) => {
  const v = CreateUserSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { username: v.username } });
  if (exists) return res.status(400).json({ error: 'Nome de usuário já existe' });
  const passwordHash = await bcrypt.hash(v.password, 12);
  const user = await prisma.user.create({
    data: { username: v.username, passwordHash, name: v.name, email: v.email, role: v.role as any },
  });
  return res.status(201).json({ success: true, id: user.id });
});

adminRouter.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role, is_active } = req.body;
  await prisma.user.update({ where: { id }, data: { role: role as any, isActive: is_active } });
  return res.json({ success: true });
});

adminRouter.put('/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { password } = z.object({ password: z.string().min(8) }).parse(req.body);
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  await prisma.session.deleteMany({ where: { userId: id } });
  return res.json({ success: true });
});
