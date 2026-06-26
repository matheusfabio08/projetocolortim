import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
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

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    include: { laboratory: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(records);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  await prisma.poLaboratory.upsert({
    where: { opId: d.po_id },
    create: { opId: d.po_id, numBatches: d.num_batches, isRecipeReady: d.is_recipe_ready, recipeOriginDate: d.recipe_origin_date, description: d.description, isApproved: d.is_approved, startTime: d.start_time, endTime: d.end_time },
    update: { numBatches: d.num_batches, isRecipeReady: d.is_recipe_ready, recipeOriginDate: d.recipe_origin_date, description: d.description, isApproved: d.is_approved, startTime: d.start_time, endTime: d.end_time },
  });

  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'laboratorio', action: d.is_approved ? 'approved' : 'processed', userId: req.user!.id } });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.poLaboratory.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
