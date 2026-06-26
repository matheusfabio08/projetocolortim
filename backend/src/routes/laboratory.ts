import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

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

router.get('/records', async (_req, res: Response) => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    include: { laboratory: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(records);
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  await prisma.poLaboratory.create({
    data: {
      opId: d.po_id, numBatches: d.num_batches, isRecipeReady: d.is_recipe_ready,
      recipeOriginDate: d.recipe_origin_date, description: d.description,
      isApproved: d.is_approved, startTime: d.start_time, endTime: d.end_time,
    },
  });

  await prisma.activityLog.create({
    data: { opId: d.po_id, stage: 'laboratorio', action: d.is_approved ? 'approved' : 'processed', userId: req.user!.id },
  });

  res.json({ success: true });
});

router.delete('/:id', async (_req, res: Response) => {
  const id = parseInt(_req.params.id);
  await prisma.poLaboratory.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
