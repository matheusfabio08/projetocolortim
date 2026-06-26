import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
router.use(authMiddleware);
const Schema = z.object({ po_id: z.number(), rolls_sent: z.number(), meters_per_roll: z.number(), discrepancy: z.string().optional() });
router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.poQuality.create({ data: { opId: v.po_id, rollsSent: v.rolls_sent, metersPerRoll: v.meters_per_roll, discrepancy: v.discrepancy } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'qualidade', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});
export default router;
