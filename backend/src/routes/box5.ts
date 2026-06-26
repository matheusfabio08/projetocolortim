import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/records', async (_req, res: Response) => {
  const [waiting, inProgressRaw] = await Promise.all([
    prisma.productionOrder.findMany({ where: { status: 'box5' }, orderBy: { createdAt: 'asc' } }),
    prisma.poInProgress.findMany({ where: { stage: 'box5' }, include: { op: true } }),
  ]);
  const inProgressIds = new Set(inProgressRaw.map(r => r.opId));
  const waitingFiltered = waiting.filter(op => !inProgressIds.has(op.id));
  res.json({ waiting: waitingFiltered, inProgress: inProgressRaw.map(r => r.op), completed: [] });
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { po_id, employee_id, has_adjustment, adjustment_details, is_reprocess, reprocess_reason, timestamp } = req.body;
  if (!po_id || !employee_id) { res.status(400).json({ error: 'Campos obrigatórios ausentes' }); return; }

  await prisma.poBox5.create({
    data: { opId: po_id, employeeId: employee_id, hasAdjustment: !!has_adjustment, adjustmentDetails: adjustment_details, isReprocess: !!is_reprocess, reprocessReason: reprocess_reason, timestamp },
  });
  await prisma.productionOrder.update({ where: { id: po_id }, data: { status: 'producao', currentStage: 'box5' } });
  await prisma.activityLog.create({ data: { opId: po_id, stage: 'box5', action: 'processed', userId: req.user!.id } });

  res.json({ success: true });
});

export default router;
