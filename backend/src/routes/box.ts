import { Router, Response } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const BoxSchema = z.object({
  po_id: z.number(),
  employee_id: z.string(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional(),
  timestamp: z.string(),
});

async function getBoxRecords(boxName: string, res: Response): Promise<void> {
  const waiting = await prisma.productionOrder.findMany({
    where: { status: boxName, isCompleted: false },
    orderBy: { createdAt: 'asc' },
    include: { inProgress: true },
  });

  const inProgress = waiting.filter(op => op.inProgress.some(ip => ip.stage === boxName));
  const waitingOnly = waiting.filter(op => !op.inProgress.some(ip => ip.stage === boxName));

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const completed = await prisma.productionOrder.findMany({
    where: { currentStage: boxName, isCompleted: false, updatedAt: { gte: cutoff } },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  res.json({ waiting: waitingOnly, inProgress, completed });
}

async function processBox(
  boxName: 'box4' | 'box5' | 'box6',
  nextStatus: string,
  req: AuthRequest,
  res: Response
): Promise<void> {
  const v = BoxSchema.safeParse(req.body);
  if (!v.success) {
    res.status(400).json({ error: v.error.flatten() });
    return;
  }
  const d = v.data;

  if (boxName === 'box4') {
    const data: Prisma.PoBox4UncheckedCreateInput = {
      opId: d.po_id,
      employeeId: d.employee_id,
      hasAdjustment: d.has_adjustment,
      adjustmentDetails: d.adjustment_details ?? null,
      isReprocess: d.is_reprocess,
      reprocessReason: d.reprocess_reason ?? null,
      timestamp: d.timestamp,
    };
    await prisma.poBox4.create({ data });
  } else if (boxName === 'box5') {
    const data: Prisma.PoBox5UncheckedCreateInput = {
      opId: d.po_id,
      employeeId: d.employee_id,
      hasAdjustment: d.has_adjustment,
      adjustmentDetails: d.adjustment_details ?? null,
      isReprocess: d.is_reprocess,
      reprocessReason: d.reprocess_reason ?? null,
      timestamp: d.timestamp,
    };
    await prisma.poBox5.create({ data });
  } else {
    const data: Prisma.PoBox6UncheckedCreateInput = {
      opId: d.po_id,
      employeeId: d.employee_id,
      hasAdjustment: d.has_adjustment,
      adjustmentDetails: d.adjustment_details ?? null,
      isReprocess: d.is_reprocess,
      reprocessReason: d.reprocess_reason ?? null,
      timestamp: d.timestamp,
    };
    await prisma.poBox6.create({ data });
  }

  await prisma.productionOrder.update({
    where: { id: d.po_id },
    data: { status: nextStatus, currentStage: boxName },
  });

  await prisma.activityLog.create({
    data: {
      opId: d.po_id,
      stage: boxName,
      action: 'processed',
      userId: req.user!.id,
      details: `Processado em ${boxName} por ${d.employee_id}`,
    },
  });

  res.json({ success: true });
}

router.get('/box4/records', authMiddleware, (_req, res) => getBoxRecords('box4', res));
router.get('/box5/records', authMiddleware, (_req, res) => getBoxRecords('box5', res));
router.get('/box6/records', authMiddleware, (_req, res) => getBoxRecords('box6', res));

router.post('/box4', authMiddleware, (req: AuthRequest, res) => processBox('box4', 'box5', req, res));
router.post('/box5', authMiddleware, (req: AuthRequest, res) => processBox('box5', 'box6', req, res));
router.post('/box6', authMiddleware, (req: AuthRequest, res) => processBox('box6', 'secadora', req, res));

export default router;
