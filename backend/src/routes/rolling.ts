import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({
  po_id: z.number(),
  employee_ids: z.any(),
  num_splices: z.number(),
  num_rolls: z.number(),
  issue_description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  await prisma.poRolling.create({
    data: { opId: d.po_id, employeeIds: d.employee_ids, numSplices: d.num_splices, numRolls: d.num_rolls, issueDescription: d.issue_description, startTime: d.start_time, endTime: d.end_time },
  });
  await prisma.productionOrder.update({ where: { id: d.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'enrolagem', action: 'completed', userId: req.user!.id } });
  res.json({ success: true });
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'enrolagem', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });
  res.json(ops);
});

export default router;
