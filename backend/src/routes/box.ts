import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const BoxSchema = z.object({
  po_id: z.number(),
  employee_id: z.string(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional(),
  timestamp: z.string(),
});

function createBoxRoutes(boxNum: 4 | 5 | 6) {
  const statusKey = `box${boxNum}` as const;

  router.post(`/${statusKey}`, authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const result = BoxSchema.safeParse(req.body);
      if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
      const v = result.data;
      const user = req.user!;

      const data = { poId: v.po_id, employeeId: v.employee_id, hasAdjustment: v.has_adjustment, adjustmentDetails: v.adjustment_details, isReprocess: v.is_reprocess, reprocessReason: v.reprocess_reason, timestamp: v.timestamp };

      if (boxNum === 4) await prisma.poBox4.create({ data });
      else if (boxNum === 5) await prisma.poBox5.create({ data });
      else await prisma.poBox6.create({ data });

      await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'producao', currentStage: statusKey } });
      await prisma.activityLog.create({ data: { opId: v.po_id, stage: statusKey, action: 'processed', userId: user.id, details: `Processado${v.has_adjustment ? ' - Com ajuste' : ''}${v.is_reprocess ? ' - Reprocesso' : ''}` } });

      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: `Erro no ${statusKey}` });
    }
  });

  router.get(`/${statusKey}/records`, authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
      const waiting = await prisma.productionOrder.findMany({ where: { status: statusKey }, orderBy: { createdAt: 'asc' } });
      const inProgressIds = await prisma.poInProgress.findMany({ where: { stage: statusKey }, select: { opId: true } });
      const ipSet = new Set(inProgressIds.map(x => x.opId));

      const waitingData = waiting.filter(op => !ipSet.has(op.id));
      const inProgressData = waiting.filter(op => ipSet.has(op.id));

      const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const completed = await prisma.productionOrder.findMany({
        where: { status: 'producao', currentStage: statusKey, updatedAt: { gte: threshold } },
      });

      return res.json({ waiting: waitingData, inProgress: inProgressData, completed });
    } catch (error) {
      return res.status(500).json({ error: `Erro ao buscar registros ${statusKey}` });
    }
  });
}

createBoxRoutes(4);
createBoxRoutes(5);
createBoxRoutes(6);

export default router;
