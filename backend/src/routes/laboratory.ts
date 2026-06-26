import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const laboratoryRouter = Router();
laboratoryRouter.use(authMiddleware);

laboratoryRouter.get('/records', async (_req, res) => {
  const records = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null },
    include: { laboratory: true },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(records);
});

laboratoryRouter.post('/', async (req: AuthRequest, res) => {
  const v = z.object({
    po_id: z.number(),
    num_batches: z.number().optional(),
    is_recipe_ready: z.boolean().optional().default(false),
    recipe_origin_date: z.string().optional(),
    description: z.string().optional(),
    is_approved: z.boolean().optional().default(false),
    start_time: z.string(),
    end_time: z.string(),
  }).parse(req.body);
  await prisma.poLaboratory.upsert({
    where: { opId: v.po_id },
    create: { opId: v.po_id, numBatches: v.num_batches, isRecipeReady: v.is_recipe_ready, recipeOriginDate: v.recipe_origin_date, description: v.description, isApproved: v.is_approved, startTime: v.start_time, endTime: v.end_time },
    update: { numBatches: v.num_batches, isRecipeReady: v.is_recipe_ready, isApproved: v.is_approved, description: v.description },
  });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'laboratorio', action: v.is_approved ? 'approved' : 'processed', userId: req.user!.id } });
  return res.json({ success: true });
});

laboratoryRouter.delete('/:id', async (_req, res) => {
  const id = parseInt(_req.params.id);
  await prisma.poLaboratory.delete({ where: { id } });
  return res.json({ success: true });
});
