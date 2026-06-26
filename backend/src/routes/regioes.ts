import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const regioesRouter = Router();
regioesRouter.use(authMiddleware);

regioesRouter.get('/', async (_req, res) => {
  const list = await prisma.regiao.findMany({ orderBy: { name: 'asc' } });
  return res.json(list);
});
