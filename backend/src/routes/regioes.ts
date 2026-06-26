import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const items = await prisma.regiao.findMany({ orderBy: { name: 'asc' } });
  res.json(items);
});

export default router;
