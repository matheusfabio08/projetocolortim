import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.put('/priority/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { priority, priority_notes } = req.body;
  await prisma.productionOrder.update({ where: { id: parseInt(req.params.id) }, data: { priority, priorityNotes: priority_notes } });
  return res.json({ success: true });
});

router.put('/sequence/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { sequence_order } = req.body;
  await prisma.productionOrder.update({ where: { id: parseInt(req.params.id) }, data: { sequenceOrder: sequence_order } });
  return res.json({ success: true });
});

router.get('/capacity-analysis', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const stages = ['preparacao', 'producao', 'secadora', 'destrinchagem', 'enrolagem', 'qualidade'];
  const capacity: any = {};
  for (const stage of stages) {
    const [total, urgent] = await Promise.all([
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false } }),
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false, priority: { gte: 3 } } }),
    ]);
    capacity[stage] = { total, urgent };
  }
  return res.json(capacity);
});

router.get('/overdue-ops', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, expectedDate: { lt: new Date() } },
    orderBy: { expectedDate: 'asc' },
  });
  return res.json(ops);
});

router.get('/priority-ops', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, priority: { gt: 0 } },
    orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }],
  });
  return res.json(ops);
});

export default router;
