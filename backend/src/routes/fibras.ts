import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const fibrasRouter = Router();
fibrasRouter.use(authMiddleware);

fibrasRouter.get('/', async (_req, res) => {
  const fibers = await prisma.fiber.findMany({ orderBy: { name: 'asc' } });
  return res.json(fibers);
});

fibrasRouter.post('/', async (req, res) => {
  const { name } = req.body;
  const fiber = await prisma.fiber.create({ data: { name } });
  return res.status(201).json(fiber);
});

fibrasRouter.delete('/:id', async (req, res) => {
  await prisma.fiber.delete({ where: { id: parseInt(req.params.id) } });
  return res.json({ success: true });
});
