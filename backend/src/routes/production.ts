import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const ProductionSchema = z.object({
  po_id: z.number(),
  box_number: z.string(),
  machine: z.string(),
  operator: z.string(),
  has_adjustment: z.boolean().default(false),
  start_date: z.string(),
  end_date: z.string(),
  meters_produced: z.number(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = ProductionSchema.parse(req.body);
    const user = req.user!;
    await prisma.poProduction.create({
      data: {
        opId: validated.po_id, boxNumber: validated.box_number, machine: validated.machine,
        operator: validated.operator, hasAdjustment: validated.has_adjustment,
        startDate: validated.start_date, endDate: validated.end_date, metersProduced: validated.meters_produced,
      },
    });
    await prisma.productionOrder.update({ where: { id: validated.po_id }, data: { status: 'secadora', currentStage: 'producao' } });
    await prisma.activityLog.create({ data: { opId: validated.po_id, stage: 'producao', action: 'completed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro na produção' });
  }
});

router.get('/in-progress', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const ops = await prisma.poInProgress.findMany({
      where: { stage: { in: ['producao', 'box1', 'box2', 'box3'] } },
      include: { op: true },
    });
    res.json(ops);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar em andamento' });
  }
});

router.post('/op-start', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { op_id, stage, box_number, machine } = req.body;
    if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage obrigatórios' }); return; }
    await prisma.poInProgress.create({ data: { opId: op_id, stage, boxNumber: box_number, machine } });
    res.json({ success: true, started_at: new Date().toISOString() });
  } catch (error: any) {
    if (error.code === 'P2002') { res.status(400).json({ error: 'OP já em andamento' }); return; }
    res.status(500).json({ error: 'Erro ao iniciar OP' });
  }
});

router.post('/op-stop', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { op_id, stage } = req.body;
    if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage obrigatórios' }); return; }
    const inProgress = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
    if (!inProgress) { res.status(400).json({ error: 'OP não está em andamento' }); return; }
    await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
    res.json({ success: true, started_at: inProgress.startedAt, stopped_at: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Erro ao parar OP' });
  }
});

router.get('/op-status/:id/:stage', authMiddleware, async (req, res): Promise<void> => {
  try {
    const opId = parseInt(req.params.id);
    const stage = req.params.stage;
    const inProgress = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId, stage } } });
    res.json({ in_progress: !!inProgress, started_at: inProgress?.startedAt, box_number: inProgress?.boxNumber, machine: inProgress?.machine });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar status' });
  }
});

export default router;
