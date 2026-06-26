import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({
  po_id: z.number(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.poProduction.create({ data: { opId: v.po_id, boxNumber: v.box_number, machine: v.machine, operator: v.operator, hasAdjustment: v.has_adjustment, startDate: v.start_date, endDate: v.end_date, metersProduced: v.meters_produced } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'producao', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});

// In-progress
router.post('/start', async (req, res): Promise<void> => {
  const { op_id, stage, box_number, machine } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage obrigatórios' }); return; }
  try {
    await prisma.poInProgress.create({ data: { opId: op_id, stage, boxNumber: box_number, machine } });
    res.json({ success: true, started_at: new Date().toISOString() });
  } catch { res.status(400).json({ error: 'OP já em progresso' }); }
});

router.post('/stop', async (req, res): Promise<void> => {
  const { op_id, stage } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage obrigatórios' }); return; }
  const record = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (!record) { res.status(400).json({ error: 'OP não está em progresso' }); return; }
  await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
  res.json({ success: true, started_at: record.startedAt, stopped_at: new Date().toISOString() });
});

router.get('/status/:id/:stage', async (req, res) => {
  const record = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: parseInt(req.params.id), stage: req.params.stage } } });
  res.json({ in_progress: !!record, started_at: record?.startedAt ?? null });
});

export default router;
