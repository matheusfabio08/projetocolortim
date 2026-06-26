import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const schema = z.object({
  po_id: z.number(),
  num_employees: z.number(),
  meters_per_employee: z.number(),
  employee_times: z.array(z.any()),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.poUntangling.create({
      data: { opId: v.po_id, numEmployees: v.num_employees, metersPerEmployee: v.meters_per_employee, employeeTimes: v.employee_times, startTime: v.start_time, endTime: v.end_time },
    });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'enrolagem', currentStage: 'destrinchagem' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'destrinchagem', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
