import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = z.object({
      po_id: z.number(), employee_ids: z.any(), num_splices: z.number(),
      num_rolls: z.number(), issue_description: z.string().optional(),
      start_time: z.string(), end_time: z.string(),
    }).parse(req.body);
    const user = req.user!;
    await prisma.poRolling.create({
      data: {
        opId: validated.po_id, employeeIds: validated.employee_ids,
        numSplices: validated.num_splices, numRolls: validated.num_rolls,
        issueDescription: validated.issue_description,
        startTime: validated.start_time, endTime: validated.end_time,
      },
    });
    await prisma.productionOrder.update({ where: { id: validated.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
    await prisma.activityLog.create({ data: { opId: validated.po_id, stage: 'enrolagem', action: 'completed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro na enrolagem' });
  }
});

export default router;
