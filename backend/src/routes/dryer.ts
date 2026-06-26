import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
router.use(authMiddleware);
const Schema = z.object({ po_id: z.number(), destination: z.string() });
router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.poDryer.create({ data: { opId: v.po_id, destination: v.destination } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: v.destination, currentStage: 'secadora' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'secadora', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});
export default router;
