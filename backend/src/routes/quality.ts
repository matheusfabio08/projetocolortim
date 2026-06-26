import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const QualitySchema = z.object({
  po_id: z.number(),
  rolls_sent: z.number(),
  meters_per_roll: z.number(),
  discrepancy: z.string().optional(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = QualitySchema.parse(req.body);

  await prisma.poQuality.create({
    data: { opId: v.po_id, rollsSent: v.rolls_sent, metersPerRoll: v.meters_per_roll, discrepancy: v.discrepancy },
  });

  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'qualidade', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'qualidade', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });

  res.json({ waiting: ops.filter(op => op.inProgress.length === 0), inProgress: ops.filter(op => op.inProgress.length > 0) });
});

export default router;
