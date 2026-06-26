import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const Schema = z.object({ po_id: z.number(), destination: z.string() });

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = Schema.parse(req.body);
  await prisma.poDryer.create({ data: { opId: v.po_id, destination: v.destination } });
  await prisma.productionOrder.update({
    where: { id: v.po_id },
    data: { status: v.destination, currentStage: 'secadora' },
  });
  await prisma.activityLog.create({
    data: { opId: v.po_id, stage: 'secadora', action: 'completed', userId: req.user!.id },
  });
  res.json({ success: true });
});

export default router;
