import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  const regions = await prisma.region.findMany({ orderBy: { name: 'asc' } });
  res.json(regions);
});

export default router;
