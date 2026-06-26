import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const transportadorasRouter = Router();
transportadorasRouter.use(authMiddleware);

transportadorasRouter.get('/', async (_req, res) => {
  const list = await prisma.transportadora.findMany({ orderBy: { name: 'asc' } });
  return res.json(list);
});

transportadorasRouter.post('/', async (req, res) => {
  const { name, contact } = req.body;
  const t = await prisma.transportadora.create({ data: { name, contact } });
  return res.status(201).json(t);
});

transportadorasRouter.delete('/:id', async (req, res) => {
  await prisma.transportadora.delete({ where: { id: parseInt(req.params.id) } });
  return res.json({ success: true });
});
