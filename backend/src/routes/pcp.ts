import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.put('/priority/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { priority, priority_notes } = req.body;
    await prisma.productionOrder.update({ where: { id }, data: { priority, priorityNotes: priority_notes } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar prioridade' }); }
});

router.put('/sequence/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { sequence_order } = req.body;
    await prisma.productionOrder.update({ where: { id }, data: { sequenceOrder: sequence_order } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar sequência' }); }
});

router.get('/capacity-analysis', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const stages = ['preparacao', 'producao', 'secadora', 'destrinchagem', 'enrolagem', 'qualidade'];
    const capacity: any = {};
    for (const stage of stages) {
      const [total, urgent] = await Promise.all([
        prisma.productionOrder.count({ where: { status: stage, isCompleted: false } }),
        prisma.productionOrder.count({ where: { status: stage, isCompleted: false, priority: { gte: 3 } } }),
      ]);
      capacity[stage] = { total, urgent };
    }
    res.json(capacity);
  } catch { res.status(500).json({ error: 'Erro na análise de capacidade' }); }
});

router.get('/overdue-ops', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const ops = await prisma.productionOrder.findMany({
      where: { isCompleted: false, expectedDate: { lt: new Date() } },
      orderBy: { expectedDate: 'asc' },
    });
    res.json(ops);
  } catch { res.status(500).json({ error: 'Erro ao buscar OPs atrasadas' }); }
});

router.get('/priority-ops', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const ops = await prisma.productionOrder.findMany({
      where: { isCompleted: false, priority: { gt: 0 } },
      orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }],
    });
    res.json(ops);
  } catch { res.status(500).json({ error: 'Erro ao buscar OPs prioritárias' }); }
});

export default router;
