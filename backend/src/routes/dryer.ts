import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const dryerRouter = Router();
dryerRouter.use(authMiddleware);

dryerRouter.post('/', async (req: AuthRequest, res) => {
  const { po_id, destination } = z.object({ po_id: z.number(), destination: z.string() }).parse(req.body);
  await prisma.poDryer.create({ data: { opId: po_id, destination } });
  await prisma.productionOrder.update({ where: { id: po_id }, data: { status: destination, currentStage: 'secadora' } });
  await prisma.activityLog.create({ data: { opId: po_id, stage: 'secadora', action: 'completed', userId: req.user!.id } });
  return res.json({ success: true });
});
