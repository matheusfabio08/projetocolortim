import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const box5Router = Router();
box5Router.use(authMiddleware);

const BoxSchema = z.object({
  po_id: z.number(),
  employee_id: z.number(),
  has_adjustment: z.boolean().optional().default(false),
  adjustment_details: z.string().optional(),
  is_reprocess: z.boolean().optional().default(false),
  reprocess_reason: z.string().optional(),
  timestamp: z.string(),
});

box5Router.get('/records', async (_req, res) => {
  const waiting = await prisma.productionOrder.findMany({ where: { status: 'box5' }, orderBy: { createdAt: 'asc' } });
  const inProgressIds = await prisma.poInProgress.findMany({ where: { stage: 'box5' }, select: { opId: true } });
  const ipSet = new Set(inProgressIds.map(r => r.opId));
  return res.json({
    waiting: waiting.filter(o => !ipSet.has(o.id)),
    inProgress: waiting.filter(o => ipSet.has(o.id)),
    completed: await prisma.productionOrder.findMany({ where: { currentStage: 'box5', isCompleted: false, status: 'producao' }, orderBy: { updatedAt: 'desc' }, take: 50 }),
  });
});

box5Router.post('/', async (req: AuthRequest, res) => {
  const v = BoxSchema.parse(req.body);
  await prisma.poBox5.create({ data: { poId: v.po_id, employeeId: v.employee_id, hasAdjustment: v.has_adjustment, adjustmentDetails: v.adjustment_details, isReprocess: v.is_reprocess, reprocessReason: v.reprocess_reason, timestamp: v.timestamp } });
  await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: 'producao', currentStage: 'box5' } });
  await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'box5', action: 'processed', userId: req.user!.id } });
  return res.json({ success: true });
});
