import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const fibras = await prisma.fiber.findMany({ orderBy: { name: 'asc' } });
  res.json(fibras);
});

router.post('/', async (req, res: Response) => {
  const { name } = req.body;
  const fiber = await prisma.fiber.create({ data: { name } });
  res.status(201).json(fiber);
});

router.delete('/:id', async (req, res: Response) => {
  await prisma.fiber.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
