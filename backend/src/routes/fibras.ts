import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const fibers = await prisma.fiber.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(fibers);
});

router.post('/', async (req, res: Response) => {
  const { name, description } = req.body;
  await prisma.fiber.create({ data: { name, description } });
  res.status(201).json({ success: true });
});

router.put('/:id', async (req, res: Response) => {
  await prisma.fiber.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  res.json({ success: true });
});

export default router;
