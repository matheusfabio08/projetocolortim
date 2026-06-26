import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const DryerSchema = z.object({
  po_id: z.number(),
  destination: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = DryerSchema.parse(req.body);

  await prisma.poDryer.create({ data: { opId: v.po_id, destination: v.destination } });
  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: v.destination, currentStage: 'secadora' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'secadora', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'secadora', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });

  res.json({ waiting: ops.filter(op => op.inProgress.length === 0), inProgress: ops.filter(op => op.inProgress.length > 0) });
});

export default router;
