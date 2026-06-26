import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const productionRouter = Router();
productionRouter.use(authMiddleware);

const Schema = z.object({
  po_id: z.number(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().optional().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

productionRouter.post('/', async (req: AuthRequest, res) => {
  const v = Schema.parse(req.body);
  await prisma.poProduction.create({
    data: { opId: v.po_id, boxNumber: v.box_number, machine: v.machine, operator: v.operator, hasAdjustment: v.has_adjustment, startDate: v.start_date, endDate: v.end_date, metersProduced: v.meters_produced },
  });
  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'producao', action: 'completed', userId: req.user!.id } });
  return res.json({ success: true });
});

productionRouter.post('/op-start', async (req: AuthRequest, res) => {
  const { op_id, stage, box_number, machine } = req.body;
  if (!op_id || !stage) return res.status(400).json({ error: 'op_id e stage são obrigatórios' });
  try {
    await prisma.poInProgress.create({ data: { opId: op_id, stage, boxNumber: box_number, machine } });
    return res.json({ success: true, started_at: new Date().toISOString() });
  } catch {
    return res.status(400).json({ error: 'OP já em progresso' });
  }
});

productionRouter.post('/op-stop', async (req: AuthRequest, res) => {
  const { op_id, stage } = req.body;
  if (!op_id || !stage) return res.status(400).json({ error: 'op_id e stage são obrigatórios' });
  const record = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (!record) return res.status(400).json({ error: 'OP não está em progresso' });
  await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
  return res.json({ success: true, started_at: record.startedAt, stopped_at: new Date().toISOString() });
});

productionRouter.get('/op-status/:id/:stage', async (req, res) => {
  const opId = parseInt(req.params.id);
  const stage = req.params.stage;
  const record = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId, stage } } });
  return res.json({ in_progress: !!record, started_at: record?.startedAt ?? null });
});
