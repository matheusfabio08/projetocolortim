import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({
  po_id: z.number(),
  rolls_sent: z.number(),
  meters_per_roll: z.number(),
  discrepancy: z.string().optional(),
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  await prisma.poQuality.create({
    data: { opId: d.po_id, rollsSent: d.rolls_sent, metersPerRoll: d.meters_per_roll, discrepancy: d.discrepancy },
  });

  await prisma.productionOrder.update({
    where: { id: d.po_id },
    data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true },
  });

  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'qualidade', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

export default router;
