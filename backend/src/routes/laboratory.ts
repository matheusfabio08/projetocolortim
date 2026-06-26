import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
router.use(authMiddleware);
const Schema = z.object({ po_id: z.number(), num_batches: z.number().optional(), is_recipe_ready: z.boolean().default(false), recipe_origin_date: z.string().optional(), description: z.string().optional(), is_approved: z.boolean().default(false), start_time: z.string(), end_time: z.string() });

router.get('/records', async (_req, res) => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    include: { laboratory: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(records);
});

router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.poLaboratory.create({ data: { opId: v.po_id, numBatches: v.num_batches, isRecipeReady: v.is_recipe_ready, recipeOriginDate: v.recipe_origin_date, description: v.description, isApproved: v.is_approved, startTime: v.start_time, endTime: v.end_time } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'laboratorio', action: v.is_approved ? 'approved' : 'processed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});

router.delete('/:id', async (_req, res): Promise<void> => {
  const id = parseInt(_req.params.id);
  await prisma.poLaboratory.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
