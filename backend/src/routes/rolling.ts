import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const rollingRouter = Router();
rollingRouter.use(authMiddleware);

rollingRouter.post('/', async (req: AuthRequest, res) => {
  const v = z.object({
    po_id: z.number(),
    employee_ids: z.any(),
    num_splices: z.number(),
    num_rolls: z.number(),
    issue_description: z.string().optional(),
    start_time: z.string(),
    end_time: z.string(),
  }).parse(req.body);
  await prisma.poRolling.create({
    data: { opId: v.po_id, employeeIds: JSON.stringify(v.employee_ids), numSplices: v.num_splices, numRolls: v.num_rolls, issueDescription: v.issue_description, startTime: v.start_time, endTime: v.end_time },
  });
  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'enrolagem', action: 'completed', userId: req.user!.id } });
  return res.json({ success: true });
});
