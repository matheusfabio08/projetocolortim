import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

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

router.get('/records', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.productionOrder.findMany({
      where: { requiresLab: true, lotNumber: null, parentOpId: null },
      include: { laboratory: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(records.map(r => ({ ...r, lab_record: r.laboratory[0] ?? null })));
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar registros de laboratório' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;
    await prisma.poLaboratory.create({ data: { opId: v.po_id, numBatches: v.num_batches, isRecipeReady: v.is_recipe_ready, recipeOriginDate: v.recipe_origin_date, description: v.description, isApproved: v.is_approved, startTime: v.start_time, endTime: v.end_time } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'laboratorio', action: v.is_approved ? 'approved' : 'processed', userId: user.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no laboratório' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.poLaboratory.delete({ where: { id: parseInt(req.params.id) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar registro de laboratório' });
  }
});

export default router;
