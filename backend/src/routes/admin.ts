import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware, requireRole('Admin'));

const CreateUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'Gerente', 'PCP', 'Almoxarifado', 'Operador', 'Laboratorio', 'Qualidade']),
});

router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
  res.json(users);
});

router.post('/users', async (req, res): Promise<void> => {
  try {
    const v = CreateUserSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { username: v.username } });
    if (exists) { res.status(400).json({ error: 'Usuário já existe' }); return; }
    const passwordHash = await bcrypt.hash(v.password, 12);
    const user = await prisma.user.create({ data: { username: v.username, passwordHash, name: v.name, email: v.email, role: v.role } });
    res.status(201).json({ success: true, id: user.id });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: e.errors }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});

router.put('/users/:id', async (req, res) => {
  const { role, is_active } = req.body;
  await prisma.user.update({ where: { id: req.params.id }, data: { role, isActive: is_active } });
  // Invalidate all sessions if deactivated
  if (is_active === false) {
    await prisma.session.deleteMany({ where: { userId: req.params.id } });
  }
  res.json({ success: true });
});

export default router;
