import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const UntanglingSchema = z.object({
  po_id: z.number(),
  num_employees: z.number(),
  meters_per_employee: z.number(),
  employee_times: z.any(),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = UntanglingSchema.parse(req.body);

  await prisma.poUntangling.create({
    data: { opId: v.po_id, numEmployees: v.num_employees, metersPerEmployee: v.meters_per_employee, employeeTimes: v.employee_times, startTime: v.start_time, endTime: v.end_time },
  });

  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'enrolagem', currentStage: 'destrinchagem' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'destrinchagem', action: 'completed', userId: req.user!.id } });

  res.json({ success: true });
});

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'destrinchagem', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });

  res.json({ waiting: ops.filter(op => op.inProgress.length === 0), inProgress: ops.filter(op => op.inProgress.length > 0) });
});

export default router;
