import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const ProductionSchema = z.object({
  po_id: z.number(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = ProductionSchema.parse(req.body);

  await prisma.poProduction.create({
    data: { opId: v.po_id, boxNumber: v.box_number, machine: v.machine, operator: v.operator, hasAdjustment: v.has_adjustment, startDate: v.start_date, endDate: v.end_date, metersProduced: v.meters_produced },
  });

  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'producao', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'producao', isCompleted: false },
    orderBy: [{ priority: 'desc' }, { entryDate: 'asc' }],
    include: { inProgress: true },
  });

  const waiting = ops.filter(op => op.inProgress.length === 0);
  const inProgress = ops.filter(op => op.inProgress.length > 0);

  res.json({ waiting, inProgress });
});

export default router;
