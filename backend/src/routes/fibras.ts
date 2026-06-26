import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  const fibras = await prisma.fiber.findMany({ orderBy: { name: 'asc' } });
  res.json(fibras);
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  const { name, description } = req.body;
  if (!name) { res.status(400).json({ error: 'Nome é obrigatório' }); return; }
  const fiber = await prisma.fiber.create({ data: { name, description } });
  res.status(201).json(fiber);
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  await prisma.fiber.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
