import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const fibras = await prisma.fiber.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  return res.json(fibras);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, code, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  const fibra = await prisma.fiber.create({ data: { name, code, description } });
  return res.status(201).json(fibra);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, code, description, is_active } = req.body;
  await prisma.fiber.update({ where: { id: parseInt(req.params.id) }, data: { name, code, description, isActive: is_active } });
  return res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.fiber.delete({ where: { id: parseInt(req.params.id) } });
  return res.json({ success: true });
});

export default router;
