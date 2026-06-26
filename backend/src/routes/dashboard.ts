import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/kpis', async (_req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [activeOps, overdueOps, completedToday, totalOps] = await Promise.all([
    prisma.productionOrder.count({ where: { isCompleted: false } }),
    prisma.productionOrder.count({ where: { isCompleted: false, expectedDate: { lt: today } } }),
    prisma.productionOrder.count({ where: { isCompleted: true, updatedAt: { gte: today, lt: tomorrow } } }),
    prisma.productionOrder.count(),
  ]);

  res.json({
    active_ops: activeOps,
    overdue_ops: overdueOps,
    completed_today: completedToday,
    productivity_rate: totalOps > 0 ? Math.round((completedToday / totalOps) * 100) : 0,
  });
});

export default router;
