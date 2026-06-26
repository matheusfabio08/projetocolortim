import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const BoxSchema = z.object({ po_id: z.number(), employee_id: z.string(), has_adjustment: z.boolean().default(false), adjustment_details: z.string().optional(), is_reprocess: z.boolean().default(false), reprocess_reason: z.string().optional(), timestamp: z.string() });

function createBoxRouter(boxName: 'box4' | 'box5' | 'box6', createFn: (data: any) => Promise<any>) {
  const router = Router();
  router.use(authMiddleware);

  router.get('/records', async (_req, res) => {
    const waiting = await prisma.productionOrder.findMany({ where: { status: boxName }, orderBy: { createdAt: 'asc' } });
    const inProgressIds = new Set((await prisma.poInProgress.findMany({ where: { stage: boxName } })).map(r => r.opId));
    res.json({
      waiting: waiting.filter(op => !inProgressIds.has(op.id)),
      inProgress: waiting.filter(op => inProgressIds.has(op.id)),
      completed: await prisma.productionOrder.findMany({ where: { status: 'producao', currentStage: boxName, updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, orderBy: { updatedAt: 'desc' } }),
    });
  });

  router.post('/', async (req: AuthRequest, res): Promise<void> => {
    try {
      const v = BoxSchema.parse(req.body);
      await createFn({ opId: v.po_id, employeeId: v.employee_id, hasAdjustment: v.has_adjustment, adjustmentDetails: v.adjustment_details, isReprocess: v.is_reprocess, reprocessReason: v.reprocess_reason, timestamp: v.timestamp });
      await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'producao', currentStage: boxName } });
      await prisma.activityLog.create({ data: { opId: v.po_id, stage: boxName, action: 'processed', userId: req.user!.id, details: `Processado${v.has_adjustment ? ' - Com ajuste' : ''}${v.is_reprocess ? ' - Reprocesso' : ''}` } });
      res.json({ success: true });
    } catch (e: any) {
      if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
      res.status(500).json({ error: 'Erro' });
    }
  });

  return router;
}

export const box4Router = createBoxRouter('box4', (d) => prisma.poBox4.create({ data: d }));
export const box5Router = createBoxRouter('box5', (d) => prisma.poBox5.create({ data: d }));
export const box6Router = createBoxRouter('box6', (d) => prisma.poBox6.create({ data: d }));

export default { box4Router, box5Router, box6Router };
