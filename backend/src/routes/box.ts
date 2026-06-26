import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const BoxSchema = z.object({
  po_id: z.number(),
  employee_id: z.string(),
  has_adjustment: z.boolean().default(false),
  adjustment_details: z.string().optional(),
  is_reprocess: z.boolean().default(false),
  reprocess_reason: z.string().optional(),
  timestamp: z.string(),
});

type BoxName = 'box4' | 'box5' | 'box6';

const boxRouter = (boxName: BoxName) => {
  const router = Router();

  router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [waiting, inProgressOps, recentlyCompleted] = await Promise.all([
      prisma.productionOrder.findMany({
        where: { status: boxName, isCompleted: false },
        orderBy: { createdAt: 'asc' },
        include: { inProgress: { where: { stage: boxName } } },
      }),
      prisma.poInProgress.findMany({
        where: { stage: boxName },
        include: { op: true },
      }),
      prisma.productionOrder.findMany({
        where: {
          currentStage: boxName,
          status: 'producao',
          updatedAt: { gte: oneDayAgo },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const inProgressIds = inProgressOps.map(ip => ip.opId);
    const waitingData = waiting.filter(op => !inProgressIds.includes(op.id));

    res.json({
      waiting: waitingData,
      inProgress: inProgressOps.map(ip => ip.op),
      completed: recentlyCompleted,
    });
  });

  router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    const v = BoxSchema.parse(req.body);
    const userId = req.user!.id;

    const createFn = boxName === 'box4'
      ? prisma.poBox4.create
      : boxName === 'box5'
      ? prisma.poBox5.create
      : prisma.poBox6.create;

    await (createFn as any)({
      data: {
        opId: v.po_id,
        employeeId: v.employee_id,
        hasAdjustment: v.has_adjustment,
        adjustmentDetails: v.adjustment_details,
        isReprocess: v.is_reprocess,
        reprocessReason: v.reprocess_reason,
        timestamp: v.timestamp,
      },
    });

    await prisma.productionOrder.update({
      where: { id: v.po_id },
      data: { status: 'producao', currentStage: boxName },
    });

    await prisma.activityLog.create({
      data: {
        opId: v.po_id,
        stage: boxName,
        action: 'processed',
        userId,
        details: `${v.has_adjustment ? 'Com ajuste' : ''}${v.is_reprocess ? ' Reprocesso' : ''}`.trim(),
      },
    });

    res.json({ success: true });
  });

  return router;
};

export default boxRouter;
