import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const schema = z.object({
  po_id: z.number(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.poProduction.create({
      data: { opId: v.po_id, boxNumber: v.box_number, machine: v.machine, operator: v.operator, hasAdjustment: v.has_adjustment, startDate: v.start_date, endDate: v.end_date, metersProduced: v.meters_produced },
    });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'producao', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'producao', isCompleted: false },
    orderBy: [{ priority: 'desc' }, { entryDate: 'asc' }],
  });
  res.json(ops);
});

export default router;
