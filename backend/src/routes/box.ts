import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const BoxSchema = z.object({
  po_id: z.number(),
  employee_id: z.number().optional(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional(),
  timestamp: z.string(),
});

type BoxName = 'box4' | 'box5' | 'box6';

export default function boxRouter(boxName: BoxName) {
  const router = Router();

  const modelMap = {
    box4: (prisma as any).poBox4,
    box5: (prisma as any).poBox5,
    box6: (prisma as any).poBox6,
  };

  router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
    try {
      const model = modelMap[boxName];
      const waiting = await prisma.productionOrder.findMany({
        where: { status: boxName },
        orderBy: { createdAt: 'asc' },
      });
      const inProgressRaw = await prisma.poInProgress.findMany({
        where: { stage: boxName },
        select: { opId: true },
      });
      const inProgressIds = new Set(inProgressRaw.map(x => x.opId));
      const waitingData = waiting.filter(op => !inProgressIds.has(op.id));
      const inProgressData = waiting.filter(op => inProgressIds.has(op.id));

      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const completed = await prisma.productionOrder.findMany({
        where: { status: 'producao', currentStage: boxName, updatedAt: { gte: oneDayAgo } },
      });
      res.json({ waiting: waitingData, inProgress: inProgressData, completed });
    } catch {
      res.status(500).json({ error: 'Erro ao buscar registros' });
    }
  });

  router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
    try {
      const validated = BoxSchema.parse(req.body);
      const user = req.user!;
      const model = modelMap[boxName];
      await model.create({
        data: {
          poId: validated.po_id, employeeId: validated.employee_id,
          hasAdjustment: validated.has_adjustment, adjustmentDetails: validated.adjustment_details,
          isReprocess: validated.is_reprocess, reprocessReason: validated.reprocess_reason,
          timestamp: validated.timestamp,
        },
      });
      await prisma.productionOrder.update({
        where: { id: validated.po_id },
        data: { status: 'producao', currentStage: boxName },
      });
      await prisma.activityLog.create({
        data: {
          opId: validated.po_id, stage: boxName, action: 'processed', userId: user.id,
          details: `${validated.has_adjustment ? 'Com ajuste' : ''}${validated.is_reprocess ? ' - Reprocesso' : ''}`.trim() || undefined,
        },
      });
      res.json({ success: true });
    } catch (error: any) {
      if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
      res.status(500).json({ error: `Erro no ${boxName}` });
    }
  });

  return router;
}
