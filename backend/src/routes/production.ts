import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

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

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = ProductionSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  await prisma.poProduction.create({
    data: {
      opId: d.po_id, boxNumber: d.box_number, machine: d.machine,
      operator: d.operator, hasAdjustment: d.has_adjustment,
      startDate: d.start_date, endDate: d.end_date, metersProduced: d.meters_produced,
    },
  });

  await prisma.productionOrder.update({
    where: { id: d.po_id },
    data: { status: 'secadora', currentStage: 'producao' },
  });

  await prisma.activityLog.create({
    data: { opId: d.po_id, stage: 'producao', action: 'completed', userId: req.user!.id },
  });

  res.json({ success: true });
});

export default router;
