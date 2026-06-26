import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const untanglingRouter = Router();
untanglingRouter.use(authMiddleware);

untanglingRouter.post('/', async (req: AuthRequest, res) => {
  const v = z.object({
    po_id: z.number(),
    num_employees: z.number(),
    meters_per_employee: z.number(),
    employee_times: z.any(),
    start_time: z.string(),
    end_time: z.string(),
  }).parse(req.body);
  await prisma.poUntangling.create({
    data: { opId: v.po_id, numEmployees: v.num_employees, metersPerEmployee: v.meters_per_employee, employeeTimes: JSON.stringify(v.employee_times), startTime: v.start_time, endTime: v.end_time },
  });
  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'enrolagem', currentStage: 'destrinchagem' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'destrinchagem', action: 'completed', userId: req.user!.id } });
  return res.json({ success: true });
});
