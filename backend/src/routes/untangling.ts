import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = z.object({
      po_id: z.number(), num_employees: z.number(), meters_per_employee: z.number(),
      employee_times: z.any(), start_time: z.string(), end_time: z.string(),
    }).parse(req.body);
    const user = req.user!;
    await prisma.poUntangling.create({
      data: {
        opId: validated.po_id, numEmployees: validated.num_employees,
        metersPerEmployee: validated.meters_per_employee, employeeTimes: validated.employee_times,
        startTime: validated.start_time, endTime: validated.end_time,
      },
    });
    await prisma.productionOrder.update({ where: { id: validated.po_id }, data: { status: 'enrolagem', currentStage: 'destrinchagem' } });
    await prisma.activityLog.create({ data: { opId: validated.po_id, stage: 'destrinchagem', action: 'completed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro na destrinchagem' });
  }
});

export default router;
