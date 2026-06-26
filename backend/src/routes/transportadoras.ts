import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const items = await prisma.transportadora.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});

router.post('/', async (req, res: Response) => {
  const { name, contact } = req.body;
  const item = await prisma.transportadora.create({ data: { name, contact } });
  res.status(201).json(item);
});

router.delete('/:id', async (req, res: Response) => {
  await prisma.transportadora.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
