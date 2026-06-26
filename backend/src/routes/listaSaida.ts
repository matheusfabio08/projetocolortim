import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: true },
    orderBy: { updatedAt: 'desc' },
    include: { quality: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  res.json(ops);
});

export default router;
