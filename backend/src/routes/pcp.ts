import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.put('/priority/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { priority, priority_notes } = req.body;
  await prisma.productionOrder.update({ where: { id }, data: { priority, priorityNotes: priority_notes } });
  res.json({ success: true });
});

router.put('/sequence/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { sequence_order } = req.body;
  await prisma.productionOrder.update({ where: { id }, data: { sequenceOrder: sequence_order } });
  res.json({ success: true });
});

router.get('/capacity-analysis', async (_req, res: Response) => {
  const stages = ['preparacao', 'producao', 'secadora', 'destrinchagem', 'enrolagem', 'qualidade'];
  const capacity: Record<string, { total: number; urgent: number }> = {};
  for (const stage of stages) {
    const [total, urgent] = await Promise.all([
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false } }),
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false, priority: { gte: 3 } } }),
    ]);
    capacity[stage] = { total, urgent };
  }
  res.json(capacity);
});

router.get('/overdue-ops', async (_req, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, expectedDate: { lt: new Date() } },
    orderBy: { expectedDate: 'asc' },
  });
  res.json(ops);
});

router.get('/priority-ops', async (_req, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, priority: { gt: 0 } },
    orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }],
  });
  res.json(ops);
});

export default router;
