import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const fibers = await prisma.fiber.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json(fibers);
  } catch { res.status(500).json({ error: 'Erro ao buscar fibras' }); }
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) { res.status(400).json({ error: 'Nome obrigatório' }); return; }
    const fiber = await prisma.fiber.create({ data: { name } });
    res.status(201).json(fiber);
  } catch { res.status(500).json({ error: 'Erro ao criar fibra' }); }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.fiber.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao excluir fibra' }); }
});

export default router;
