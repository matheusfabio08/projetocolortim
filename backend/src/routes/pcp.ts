import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.put('/priority/:id', authMiddleware, async (req, res): Promise<void> => {
  const { priority, priority_notes } = req.body;
  await prisma.productionOrder.update({ where: { id: parseInt(req.params.id) }, data: { priority: parseInt(priority), priorityNotes: priority_notes } });
  res.json({ success: true });
});

router.put('/sequence/:id', authMiddleware, async (req, res): Promise<void> => {
  const { sequence_order } = req.body;
  await prisma.productionOrder.update({ where: { id: parseInt(req.params.id) }, data: { sequenceOrder: parseInt(sequence_order) } });
  res.json({ success: true });
});

router.get('/capacity-analysis', authMiddleware, async (_req, res): Promise<void> => {
  const stages = ['preparacao', 'producao', 'secadora', 'destrinchagem', 'enrolagem', 'qualidade'];
  const result: Record<string, { total: number; urgent: number }> = {};
  for (const stage of stages) {
    const [total, urgent] = await Promise.all([
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false } }),
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false, priority: { gte: 3 } } }),
    ]);
    result[stage] = { total, urgent };
  }
  res.json(result);
});

router.get('/overdue-ops', authMiddleware, async (_req, res): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, expectedDate: { lt: new Date() } },
    orderBy: { expectedDate: 'asc' },
  });
  res.json(ops);
});

router.get('/priority-ops', authMiddleware, async (_req, res): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, priority: { gt: 0 } },
    orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }],
  });
  res.json(ops);
});

export default router;
