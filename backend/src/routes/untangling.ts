import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
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

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = Schema.parse(req.body);
  await prisma.poUntangling.create({
    data: {
      opId: v.po_id,
      numEmployees: v.num_employees,
      metersPerEmployee: v.meters_per_employee,
      employeeTimes: v.employee_times,
      startTime: v.start_time,
      endTime: v.end_time,
    },
  });
  await prisma.productionOrder.update({
    where: { id: v.po_id },
    data: { status: 'enrolagem', currentStage: 'destrinchagem' },
  });
  await prisma.activityLog.create({
    data: { opId: v.po_id, stage: 'destrinchagem', action: 'completed', userId: req.user!.id },
  });
  res.json({ success: true });
});

export default router;
