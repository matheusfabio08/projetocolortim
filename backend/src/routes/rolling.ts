import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({
  po_id: z.number(),
  employee_ids: z.any(),
  num_splices: z.number(),
  num_rolls: z.number(),
  issue_description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  await prisma.poRolling.create({
    data: {
      opId: d.po_id, employeeIds: d.employee_ids, numSplices: d.num_splices,
      numRolls: d.num_rolls, issueDescription: d.issue_description,
      startTime: d.start_time, endTime: d.end_time,
    },
  });

  await prisma.productionOrder.update({ where: { id: d.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'enrolagem', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

export default router;
