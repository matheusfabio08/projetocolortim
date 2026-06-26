import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const fibers = await prisma.fiber.findMany({ orderBy: { name: 'asc' } });
  res.json(fibers);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, code, description } = req.body;
  if (!name || !code) { res.status(400).json({ error: 'Nome e código obrigatórios' }); return; }
  const fiber = await prisma.fiber.create({ data: { name, code, description } });
  res.status(201).json(fiber);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, code, description } = req.body;
  await prisma.fiber.update({ where: { id: parseInt(req.params.id) }, data: { name, code, description } });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.fiber.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
