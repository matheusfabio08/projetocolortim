import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = z.object({ po_id: z.number(), destination: z.string() }).safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  await prisma.poDryer.create({ data: { opId: d.po_id, destination: d.destination } });
  await prisma.productionOrder.update({ where: { id: d.po_id }, data: { status: d.destination, currentStage: 'secadora' } });
  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'secadora', action: 'completed', userId: req.user!.id } });
  res.json({ success: true });
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'secadora', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });
  res.json(ops);
});

export default router;
