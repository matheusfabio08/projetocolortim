import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const r = await prisma.region.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(r);
});

router.post('/', async (req, res: Response) => {
  await prisma.region.create({ data: { name: req.body.name } });
  res.status(201).json({ success: true });
});

export default router;
