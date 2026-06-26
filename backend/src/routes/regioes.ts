import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const result = await prisma.region.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(result);
});

export default router;
