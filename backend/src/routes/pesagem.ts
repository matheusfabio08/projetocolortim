import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({
  op_id: z.number(),
  employee_id: z.string(),
  weight: z.number(),
  notes: z.string().optional(),
  timestamp: z.string(),
  is_completed: z.boolean().default(false),
});

router.get('/records', async (_req, res: Response) => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    orderBy: { createdAt: 'desc' },
    include: {
      laboratory: { orderBy: { createdAt: 'desc' }, take: 1 },
      pesagem: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
  res.json(records);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const v = Schema.parse(req.body);
  await prisma.poPesagem.create({
    data: {
      opId: v.op_id,
      employeeId: v.employee_id,
      weight: v.weight,
      notes: v.notes,
      timestamp: v.timestamp,
      isCompleted: v.is_completed,
    },
  });
  if (v.is_completed) {
    await prisma.productionOrder.update({
      where: { id: v.op_id },
      data: { recipeWeighed: true },
    });
  }
  await prisma.activityLog.create({
    data: { opId: v.op_id, stage: 'pesagem', action: v.is_completed ? 'completed' : 'started', userId: req.user!.id },
  });
  res.json({ success: true });
});

export default router;
