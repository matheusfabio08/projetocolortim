import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const Schema = z.object({
  po_id: z.number(),
  employee_ids: z.any(),
  num_splices: z.number(),
  num_rolls: z.number(),
  issue_description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string(),
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = Schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;
    await prisma.poRolling.create({ data: { opId: v.po_id, employeeIds: v.employee_ids, numSplices: v.num_splices, numRolls: v.num_rolls, issueDescription: v.issue_description, startTime: v.start_time, endTime: v.end_time } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'enrolagem', action: 'completed', userId: user.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na enrolagem' });
  }
});

export default router;
