import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

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
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;
    await prisma.poUntangling.create({ data: { opId: v.po_id, numEmployees: v.num_employees, metersPerEmployee: v.meters_per_employee, employeeTimes: v.employee_times, startTime: v.start_time, endTime: v.end_time } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'enrolagem', currentStage: 'destrinchagem' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'destrinchagem', action: 'completed', userId: user.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na destrinchagem' });
  }
});

export default router;
