import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const CreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['Admin', 'PCP', 'Gerenciamento', 'Almoxarifado', 'Operador']),
});

router.get('/users', authMiddleware, requireRole('Admin'), async (req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, select: { id: true, username: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
  return res.json(users);
});

router.post('/users', authMiddleware, requireRole('Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = CreateUserSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const { username, password, name, email, role } = result.data;

    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) return res.status(400).json({ error: 'Usuário ou email já existe' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { username, passwordHash, name, email, role } });

    return res.status(201).json({ success: true, id: user.id });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.put('/users/:id', authMiddleware, requireRole('Admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { role, is_active, password } = req.body;
    const data: any = {};
    if (role) data.role = role;
    if (is_active !== undefined) data.isActive = is_active;
    if (password) data.passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({ where: { id: req.params.id }, data });

    // Invalidate all sessions if user deactivated
    if (is_active === false) {
      await prisma.session.deleteMany({ where: { userId: req.params.id } });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

export default router;
