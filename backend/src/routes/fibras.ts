import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const result = await prisma.fiber.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(result);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Nome obrigatório' }); return; }
  await prisma.fiber.create({ data: { name } });
  res.status(201).json({ success: true });
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, is_active } = req.body;
  await prisma.fiber.update({ where: { id: parseInt(req.params.id) }, data: { name, isActive: is_active } });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.fiber.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
