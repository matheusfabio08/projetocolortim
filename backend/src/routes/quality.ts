import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const qualityRouter = Router();
qualityRouter.use(authMiddleware);

qualityRouter.post('/', async (req: AuthRequest, res) => {
  const v = z.object({
    po_id: z.number(),
    rolls_sent: z.number(),
    meters_per_roll: z.number(),
    discrepancy: z.string().optional(),
  }).parse(req.body);
  await prisma.poQuality.create({ data: { opId: v.po_id, rollsSent: v.rolls_sent, metersPerRoll: v.meters_per_roll, discrepancy: v.discrepancy } });
  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'qualidade', action: 'completed', userId: req.user!.id } });
  return res.json({ success: true });
});
