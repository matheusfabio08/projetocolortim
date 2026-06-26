import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({
  po_id: z.number(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  await prisma.poProduction.create({
    data: { opId: d.po_id, boxNumber: d.box_number, machine: d.machine, operator: d.operator, hasAdjustment: d.has_adjustment, startDate: d.start_date, endDate: d.end_date, metersProduced: d.meters_produced },
  });
  await prisma.productionOrder.update({ where: { id: d.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'producao', action: 'completed', userId: req.user!.id } });
  res.json({ success: true });
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: { in: ['producao', 'box4', 'box5', 'box6'] }, isCompleted: false },
    orderBy: [{ priority: 'desc' }, { entryDate: 'asc' }],
    include: { inProgress: true },
  });
  res.json(ops);
});

export default router;
