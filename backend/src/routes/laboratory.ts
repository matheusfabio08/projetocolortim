import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const orders = await prisma.productionOrder.findMany({
      where: { requiresLab: true, lotNumber: null, parentOpId: null },
      include: { laboratory: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar registros de laboratório' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = z.object({
      po_id: z.number(), num_batches: z.number().optional(), is_recipe_ready: z.boolean().default(false),
      recipe_origin_date: z.string().optional(), description: z.string().optional(),
      is_approved: z.boolean().default(false), start_time: z.string(), end_time: z.string(),
    }).parse(req.body);
    const user = req.user!;
    await prisma.poLaboratory.create({
      data: {
        opId: validated.po_id, numBatches: validated.num_batches, isRecipeReady: validated.is_recipe_ready,
        recipeOriginDate: validated.recipe_origin_date, description: validated.description,
        isApproved: validated.is_approved, startTime: validated.start_time, endTime: validated.end_time,
      },
    });
    await prisma.activityLog.create({ data: { opId: validated.po_id, stage: 'laboratorio', action: validated.is_approved ? 'approved' : 'processed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro no laboratório' });
  }
});

router.delete('/:id', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const id = parseInt(_req.params.id);
    await prisma.poLaboratory.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir registro' });
  }
});

export default router;
