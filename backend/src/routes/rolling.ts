import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const RollingSchema = z.object({
  po_id: z.number(),
  employee_ids: z.any(),
  num_splices: z.number(),
  num_rolls: z.number(),
  issue_description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = RollingSchema.parse(req.body);

  await prisma.poRolling.create({
    data: { opId: v.po_id, employeeIds: v.employee_ids, numSplices: v.num_splices, numRolls: v.num_rolls, issueDescription: v.issue_description, startTime: v.start_time, endTime: v.end_time },
  });

  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'enrolagem', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'enrolagem', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });

  res.json({ waiting: ops.filter(op => op.inProgress.length === 0), inProgress: ops.filter(op => op.inProgress.length > 0) });
});

export default router;
