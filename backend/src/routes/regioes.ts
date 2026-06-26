import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const items = await prisma.regiao.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  return res.json(items);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, code } = req.body;
  const item = await prisma.regiao.create({ data: { name, code } });
  return res.status(201).json(item);
});

export default router;
