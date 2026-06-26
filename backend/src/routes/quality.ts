import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({
  po_id: z.number(),
  rolls_sent: z.number(),
  meters_per_roll: z.number(),
  discrepancy: z.string().optional(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  await prisma.poQuality.create({
    data: { opId: d.po_id, rollsSent: d.rolls_sent, metersPerRoll: d.meters_per_roll, discrepancy: d.discrepancy },
  });
  await prisma.productionOrder.update({ where: { id: d.po_id }, data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true } });
  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'qualidade', action: 'completed', userId: req.user!.id } });
  res.json({ success: true });
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'qualidade', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });
  res.json(ops);
});

export default router;
