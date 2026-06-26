import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware, requireRole('Admin'));

const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'PCP', 'Gerenciamento', 'Almoxarifado', 'Laboratorio', 'Operador']),
});

router.get('/users', async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
  res.json(users);
});

router.post('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  const exists = await prisma.user.findFirst({ where: { OR: [{ username: d.username }, { email: d.email }] } });
  if (exists) { res.status(400).json({ error: 'Usuário ou e-mail já cadastrado' }); return; }

  const passwordHash = await bcrypt.hash(d.password, 12);
  const user = await prisma.user.create({
    data: { username: d.username, passwordHash, name: d.name, email: d.email, role: d.role as any },
    select: { id: true, username: true, name: true, email: true, role: true, isActive: true },
  });

  res.status(201).json({ success: true, user });
});

router.put('/users/:id', async (req, res: Response) => {
  const { role, is_active } = req.body;
  await prisma.user.update({
    where: { id: req.params.id },
    data: { role, isActive: is_active },
  });
  res.json({ success: true });
});

export default router;
