import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware, requireRole('Admin'));

router.get('/users', async (_req, res): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch { res.status(500).json({ error: 'Erro ao buscar usuários' }); }
});

router.post('/users', async (req: AuthRequest, res): Promise<void> => {
  try {
    const { username, password, name, email, role } = z.object({
      username: z.string().min(3), password: z.string().min(6),
      name: z.string().min(1), email: z.string().email(), role: z.string(),
    }).parse(req.body);

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) { res.status(400).json({ error: 'Nome de usuário já existe' }); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { username, passwordHash, name, email, role } });
    res.status(201).json({ success: true, id: user.id });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: error.errors }); return; }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.put('/users/:id', async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    await prisma.user.update({ where: { id }, data: { role, isActive: is_active } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar usuário' }); }
});

export default router;
