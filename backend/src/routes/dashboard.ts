import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/kpis', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeOps, overdueOps, completedToday] = await Promise.all([
      prisma.productionOrder.count({ where: { isCompleted: false } }),
      prisma.productionOrder.count({
        where: { isCompleted: false, expectedDate: { lt: today } },
      }),
      prisma.productionOrder.count({
        where: {
          isCompleted: true,
          updatedAt: { gte: today, lt: tomorrow },
        },
      }),
    ]);

    const totalOps = await prisma.productionOrder.count();
    const productivityRate = totalOps > 0
      ? Math.round((completedToday / totalOps) * 100)
      : 0;

    res.json({ active_ops: activeOps, overdue_ops: overdueOps, completed_today: completedToday, productivity_rate: productivityRate });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar KPIs' });
  }
});

export default router;
