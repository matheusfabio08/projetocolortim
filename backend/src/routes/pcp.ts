import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const pcpRouter = Router();
pcpRouter.use(authMiddleware);

pcpRouter.put('/priority/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { priority, priority_notes } = req.body;
  await prisma.productionOrder.update({ where: { id }, data: { priority, priorityNotes: priority_notes } });
  return res.json({ success: true });
});

pcpRouter.put('/sequence/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { sequence_order } = req.body;
  await prisma.productionOrder.update({ where: { id }, data: { sequenceOrder: sequence_order } });
  return res.json({ success: true });
});

pcpRouter.get('/capacity-analysis', async (_req, res) => {
  const stages = ['preparacao', 'producao', 'secadora', 'destrinchagem', 'enrolagem', 'qualidade'];
  const capacity: Record<string, any> = {};
  await Promise.all(stages.map(async (stage) => {
    const [total, urgent] = await Promise.all([
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false } }),
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false, priority: { gte: 3 } } }),
    ]);
    capacity[stage] = { total, urgent };
  }));
  return res.json(capacity);
});

pcpRouter.get('/overdue-ops', async (_req, res) => {
  const ops = await prisma.productionOrder.findMany({ where: { isCompleted: false, expectedDate: { lt: new Date() } }, orderBy: { expectedDate: 'asc' } });
  return res.json(ops);
});

pcpRouter.get('/priority-ops', async (_req, res) => {
  const ops = await prisma.productionOrder.findMany({ where: { isCompleted: false, priority: { gt: 0 } }, orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }] });
  return res.json(ops);
});
