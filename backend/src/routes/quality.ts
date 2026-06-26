import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const Schema = z.object({
  po_id: z.number(),
  rolls_sent: z.number(),
  meters_per_roll: z.number(),
  discrepancy: z.string().optional(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;
    await prisma.poQuality.create({ data: { opId: v.po_id, rollsSent: v.rolls_sent, metersPerRoll: v.meters_per_roll, discrepancy: v.discrepancy } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'qualidade', action: 'completed', userId: user.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na qualidade' });
  }
});

export default router;
