import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const schema = z.object({
  po_id: z.number(),
  employee_id: z.number(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional().nullable(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional().nullable(),
  timestamp: z.string(),
});

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  const [waiting, all] = await Promise.all([
    prisma.productionOrder.findMany({ where: { status: 'box6' }, orderBy: { createdAt: 'asc' } }),
    prisma.productionOrder.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);
  const inProgress = [];
  for (const op of waiting) {
    const ip = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op.id, stage: 'box6' } } });
    if (ip) inProgress.push(op);
  }
  const waitingFiltered = waiting.filter(op => !inProgress.find(ip => ip.id === op.id));
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const completed = all.filter(op => op.status === 'producao' && op.currentStage === 'box6' && op.updatedAt > cutoff);
  res.json({ waiting: waitingFiltered, inProgress, completed });
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.poBox6.create({ data: { poId: v.po_id, employeeId: v.employee_id, hasAdjustment: v.has_adjustment, adjustmentDetails: v.adjustment_details, isReprocess: v.is_reprocess, reprocessReason: v.reprocess_reason, timestamp: v.timestamp } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'producao', currentStage: 'box6' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'box6', action: 'processed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
