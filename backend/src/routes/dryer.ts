import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { po_id, destination } = req.body;
  if (!po_id || !destination) { res.status(400).json({ error: 'po_id e destination obrigatórios' }); return; }

  await prisma.poDryer.create({ data: { opId: po_id, destination } });
  await prisma.productionOrder.update({ where: { id: po_id }, data: { status: destination, currentStage: 'secadora' } });
  await prisma.activityLog.create({ data: { opId: po_id, stage: 'secadora', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

export default router;
