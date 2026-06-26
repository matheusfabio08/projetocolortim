import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/kpis', authMiddleware, async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [activeOps, overdueOps, completedToday] = await Promise.all([
    prisma.productionOrder.count({ where: { isCompleted: false } }),
    prisma.productionOrder.count({ where: { isCompleted: false, expectedDate: { lt: new Date() } } }),
    prisma.productionOrder.count({ where: { isCompleted: true, updatedAt: { gte: today, lt: tomorrow } } }),
  ]);

  return res.json({ active_ops: activeOps, overdue_ops: overdueOps, completed_today: completedToday });
});
