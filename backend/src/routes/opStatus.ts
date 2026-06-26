import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/op-start', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { op_id, stage, box_number, machine } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage obrigatórios' }); return; }

  const existing = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (existing) { res.status(400).json({ error: 'OP já em andamento' }); return; }

  await prisma.poInProgress.create({ data: { opId: op_id, stage, boxNumber: box_number, machine } });
  res.json({ success: true, started_at: new Date().toISOString() });
});

router.post('/op-stop', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { op_id, stage } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage obrigatórios' }); return; }

  const inProgress = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (!inProgress) { res.status(400).json({ error: 'OP não está em andamento' }); return; }

  await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
  res.json({ success: true, started_at: inProgress.startedAt, stopped_at: new Date().toISOString() });
});

router.get('/op-status/:id/:stage', authMiddleware, async (req: AuthRequest, res: Response) => {
  const inProgress = await prisma.poInProgress.findUnique({
    where: { opId_stage: { opId: parseInt(req.params.id), stage: req.params.stage } },
  });

  res.json({ in_progress: !!inProgress, started_at: inProgress?.startedAt ?? null, box_number: inProgress?.boxNumber ?? null, machine: inProgress?.machine ?? null });
});

export default router;
