import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const Schema = z.object({
  op_id: z.number(),
  employee_id: z.string(),
  total_weight: z.number(),
  start_time: z.string(),
  end_time: z.string(),
  notes: z.string().optional(),
});

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const waiting = await prisma.productionOrder.findMany({
      where: { requiresLab: true, lotNumber: null, parentOpId: null, recipeWeighed: false, laboratory: { none: {} } },
      orderBy: { createdAt: 'desc' },
    });

    const inProgress = await prisma.$queryRaw`
      SELECT po.*, pes.id as pesagem_id, pes.start_time as pesagem_start_time
      FROM production_orders po
      INNER JOIN po_pesagem pes ON po.id = pes.op_id
      WHERE po.requires_lab = true AND po.recipe_weighed = false
      LIMIT 100
    `;

    const completed = await prisma.productionOrder.findMany({
      where: { requiresLab: true, recipeWeighed: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return res.json({ waiting, inProgress, completed });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar pesagens' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;
    await prisma.poPesagem.create({ data: { opId: v.op_id, employeeId: v.employee_id, totalWeight: v.total_weight, startTime: v.start_time, endTime: v.end_time, notes: v.notes } });
    await prisma.productionOrder.update({ where: { id: v.op_id }, data: { recipeWeighed: true } });
    await prisma.activityLog.create({ data: { opId: v.op_id, stage: 'pesagem', action: 'completed', userId: user.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na pesagem' });
  }
});

export default router;
