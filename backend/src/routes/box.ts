import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const BoxSchema = z.object({
  po_id: z.number(),
  employee_id: z.number(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional(),
  timestamp: z.string(),
});

function makeBoxRoutes(boxNum: 4 | 5 | 6) {
  const statusKey = `box${boxNum}` as const;

  router.post(`/box${boxNum}`, authMiddleware, async (req: AuthRequest, res: Response) => {
    const v = BoxSchema.parse(req.body);
    const userId = req.user!.id;
    const data = { opId: v.po_id, employeeId: v.employee_id, hasAdjustment: v.has_adjustment, adjustmentDetails: v.adjustment_details, isReprocess: v.is_reprocess, reprocessReason: v.reprocess_reason, timestamp: v.timestamp };

    if (boxNum === 4) await prisma.poBox4.create({ data });
    else if (boxNum === 5) await prisma.poBox5.create({ data });
    else await prisma.poBox6.create({ data });

    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'producao', currentStage: statusKey } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: statusKey, action: 'processed', userId, details: `Emp ${v.employee_id}${v.has_adjustment ? ' - Ajuste' : ''}${v.is_reprocess ? ' - Reprocesso' : ''}` } });

    res.json({ success: true });
  });

  router.get(`/box${boxNum}/records`, authMiddleware, async (_req: AuthRequest, res: Response) => {
    const [waiting, inProgressRaw, recentlyDone] = await Promise.all([
      prisma.productionOrder.findMany({ where: { status: statusKey, isCompleted: false }, orderBy: { entryDate: 'asc' }, include: { inProgress: true } }),
      prisma.productionOrder.findMany({ where: { status: statusKey }, include: { inProgress: { where: { stage: statusKey } } } }),
      prisma.productionOrder.findMany({
        where: { status: 'producao', currentStage: statusKey, updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const inProgress = inProgressRaw.filter(op => op.inProgress.length > 0);
    const waitingFiltered = waiting.filter(op => !inProgress.find(ip => ip.id === op.id));

    res.json({ waiting: waitingFiltered, inProgress, completed: recentlyDone });
  });
}

makeBoxRoutes(4);
makeBoxRoutes(5);
makeBoxRoutes(6);

export default router;
