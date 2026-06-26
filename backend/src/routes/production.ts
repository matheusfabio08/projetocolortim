import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const ProdSchema = z.object({
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
  try {
    const result = ProdSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;

    await prisma.poProduction.create({ data: { opId: v.po_id, boxNumber: v.box_number, machine: v.machine, operator: v.operator, hasAdjustment: v.has_adjustment, startDate: v.start_date, endDate: v.end_date, metersProduced: v.meters_produced } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'producao', action: 'completed', userId: user.id } });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na produção' });
  }
});

// Get in-progress OPs for production
router.get('/in-progress', authMiddleware, async (req: AuthRequest, res: Response) => {
  const ops = await prisma.poInProgress.findMany({
    where: { stage: { in: ['producao', 'box1', 'box2', 'box3'] } },
    include: { op: true },
  });
  return res.json(ops);
});

export default router;
