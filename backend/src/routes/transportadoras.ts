import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const carriers = await prisma.carrier.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json(carriers);
  } catch { res.status(500).json({ error: 'Erro ao buscar transportadoras' }); }
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { name, contact } = req.body;
    if (!name) { res.status(400).json({ error: 'Nome obrigatório' }); return; }
    const carrier = await prisma.carrier.create({ data: { name, contact } });
    res.status(201).json(carrier);
  } catch { res.status(500).json({ error: 'Erro ao criar transportadora' }); }
});

export default router;
