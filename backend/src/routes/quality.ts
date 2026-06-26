import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = z.object({
      po_id: z.number(), rolls_sent: z.number(), meters_per_roll: z.number(), discrepancy: z.string().optional(),
    }).parse(req.body);
    const user = req.user!;
    await prisma.poQuality.create({
      data: { opId: validated.po_id, rollsSent: validated.rolls_sent, metersPerRoll: validated.meters_per_roll, discrepancy: validated.discrepancy },
    });
    await prisma.productionOrder.update({ where: { id: validated.po_id }, data: { status: 'concluido', currentStage: 'qualidade', isCompleted: true } });
    await prisma.activityLog.create({ data: { opId: validated.po_id, stage: 'qualidade', action: 'completed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro na qualidade' });
  }
});

export default router;
