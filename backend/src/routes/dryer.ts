import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { po_id, destination } = req.body;
    if (!po_id || !destination) return res.status(400).json({ error: 'po_id e destination obrigatórios' });
    const user = req.user!;
    await prisma.poDryer.create({ data: { opId: po_id, destination } });
    await prisma.productionOrder.update({ where: { id: po_id }, data: { status: destination, currentStage: 'secadora' } });
    await prisma.activityLog.create({ data: { opId: po_id, stage: 'secadora', action: 'completed', userId: user.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na secadora' });
  }
});

export default router;
