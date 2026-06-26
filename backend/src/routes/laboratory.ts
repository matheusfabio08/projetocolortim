import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const Schema = z.object({
  po_id: z.number(),
  num_batches: z.number().optional(),
  is_recipe_ready: z.boolean().default(false),
  recipe_origin_date: z.string().optional(),
  description: z.string().optional(),
  is_approved: z.boolean().default(false),
  start_time: z.string(),
  end_time: z.string(),
});

router.get('/records', authMiddleware, async (_req, res: Response) => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    orderBy: { createdAt: 'desc' },
    include: { laboratory: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
  res.json(records);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = Schema.parse(req.body);
  await prisma.poLaboratory.create({
    data: {
      opId: v.po_id,
      numBatches: v.num_batches,
      isRecipeReady: v.is_recipe_ready,
      recipeOriginDate: v.recipe_origin_date,
      description: v.description,
      isApproved: v.is_approved,
      startTime: v.start_time,
      endTime: v.end_time,
    },
  });
  await prisma.activityLog.create({
    data: { opId: v.po_id, stage: 'laboratorio', action: v.is_approved ? 'approved' : 'processed', userId: req.user!.id },
  });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req, res: Response) => {
  await prisma.poLaboratory.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
