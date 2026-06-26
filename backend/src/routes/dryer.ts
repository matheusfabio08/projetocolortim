import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { po_id, destination } = z.object({ po_id: z.number(), destination: z.string() }).parse(req.body);
    const user = req.user!;
    await prisma.poDryer.create({ data: { opId: po_id, destination } });
    await prisma.productionOrder.update({ where: { id: po_id }, data: { status: destination, currentStage: 'secadora' } });
    await prisma.activityLog.create({ data: { opId: po_id, stage: 'secadora', action: 'completed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro na secadora' });
  }
});

export default router;
