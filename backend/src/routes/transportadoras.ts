import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  const carriers = await prisma.carrier.findMany({ orderBy: { name: 'asc' } });
  res.json(carriers);
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Nome é obrigatório' }); return; }
  const carrier = await prisma.carrier.create({ data: { name } });
  res.status(201).json(carrier);
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  await prisma.carrier.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
