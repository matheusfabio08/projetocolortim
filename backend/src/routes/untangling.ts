import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({
  po_id: z.number(),
  num_employees: z.number(),
  meters_per_employee: z.number(),
  employee_times: z.any(),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;

  await prisma.poUntangling.create({
    data: { opId: d.po_id, numEmployees: d.num_employees, metersPerEmployee: d.meters_per_employee, employeeTimes: d.employee_times, startTime: d.start_time, endTime: d.end_time },
  });
  await prisma.productionOrder.update({ where: { id: d.po_id }, data: { status: 'enrolagem', currentStage: 'destrinchagem' } });
  await prisma.activityLog.create({ data: { opId: d.po_id, stage: 'destrinchagem', action: 'completed', userId: req.user!.id } });
  res.json({ success: true });
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({
    where: { status: 'destrinchagem', isCompleted: false },
    orderBy: { entryDate: 'asc' },
    include: { inProgress: true },
  });
  res.json(ops);
});

export default router;
