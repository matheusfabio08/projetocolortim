import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
router.use(authMiddleware);
const Schema = z.object({ po_id: z.number(), employee_ids: z.array(z.string()), num_splices: z.number(), num_rolls: z.number(), issue_description: z.string().optional(), start_time: z.string(), end_time: z.string() });
router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.poRolling.create({ data: { opId: v.po_id, employeeIds: v.employee_ids, numSplices: v.num_splices, numRolls: v.num_rolls, issueDescription: v.issue_description, startTime: v.start_time, endTime: v.end_time } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'qualidade', currentStage: 'enrolagem' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'enrolagem', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});
export default router;
