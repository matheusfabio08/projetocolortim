import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// Start OP in a stage
router.post('/start', async (req: AuthRequest, res: Response) => {
  const { op_id, stage, box_number, machine } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage são obrigatórios' }); return; }

  const existing = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (existing) { res.status(400).json({ error: 'OP já em andamento' }); return; }

  const record = await prisma.poInProgress.create({
    data: { opId: op_id, stage, boxNumber: box_number, machine },
  });
  res.json({ success: true, started_at: record.startedAt });
});

// Stop OP from a stage
router.post('/stop', async (req: AuthRequest, res: Response) => {
  const { op_id, stage } = req.body;

  const record = await prisma.poInProgress.findUnique({
    where: { opId_stage: { opId: op_id, stage } },
  });
  if (!record) { res.status(400).json({ error: 'OP não está em andamento' }); return; }

  await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
  res.json({ success: true, started_at: record.startedAt, stopped_at: new Date() });
});

// Get OP status in a stage
router.get('/:id/:stage', async (req, res: Response) => {
  const opId = parseInt(req.params.id);
  const { stage } = req.params;

  const record = await prisma.poInProgress.findUnique({
    where: { opId_stage: { opId, stage } },
  });

  res.json({
    in_progress: !!record,
    started_at: record?.startedAt ?? null,
    box_number: record?.boxNumber ?? null,
    machine: record?.machine ?? null,
  });
});

// PCP routes
router.put('/pcp/priority/:id', async (req, res: Response) => {
  const { priority, priority_notes } = req.body;
  await prisma.productionOrder.update({
    where: { id: parseInt(req.params.id) },
    data: { priority, priorityNotes: priority_notes },
  });
  res.json({ success: true });
});

router.get('/pcp/overdue', async (_req, res: Response) => {
  const today = new Date();
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, expectedDate: { lt: today } },
    orderBy: { expectedDate: 'asc' },
  });
  res.json(ops);
});

router.get('/pcp/priority-ops', async (_req, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { isCompleted: false, priority: { gt: 0 } },
    orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }],
  });
  res.json(ops);
});

export default router;
