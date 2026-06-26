import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const regions = await prisma.region.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json(regions);
  } catch { res.status(500).json({ error: 'Erro ao buscar regiões' }); }
});

export default router;
