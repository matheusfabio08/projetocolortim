import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const schema = z.object({
  po_id: z.number(),
  num_batches: z.number().optional().nullable(),
  is_recipe_ready: z.boolean().default(false),
  recipe_origin_date: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  is_approved: z.boolean().default(false),
  start_time: z.string(),
  end_time: z.string(),
});

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    orderBy: { createdAt: 'desc' },
    include: { laboratory: true },
  });
  res.json(records);
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.poLaboratory.create({
      data: { opId: v.po_id, numBatches: v.num_batches, isRecipeReady: v.is_recipe_ready, recipeOriginDate: v.recipe_origin_date, description: v.description, isApproved: v.is_approved, startTime: v.start_time, endTime: v.end_time },
    });
    await prisma.activityLog.create({
      data: { opId: v.po_id, stage: 'laboratorio', action: v.is_approved ? 'approved' : 'processed', userId: req.user!.id },
    });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  await prisma.poLaboratory.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
