import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/records', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const [waiting, inProgress, completed] = await Promise.all([
    prisma.productionOrder.findMany({
      where: { requiresLab: true, lotNumber: null, parentOpId: null, recipeWeighed: false, pesagem: null },
      include: { laboratory: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productionOrder.findMany({
      where: { requiresLab: true, pesagem: { endTime: null, startTime: { not: null } } },
      include: { pesagem: true },
    }),
    prisma.productionOrder.findMany({
      where: { requiresLab: true, pesagem: { endTime: { not: null } } },
      include: { pesagem: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    }),
  ]);
  res.json({ waiting, inProgress, completed });
});

router.post('/start', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { op_id } = req.body;
  if (!op_id) { res.status(400).json({ error: 'op_id obrigatório' }); return; }
  await prisma.poPesagem.upsert({
    where: { opId: op_id },
    create: { opId: op_id, startTime: new Date().toISOString() },
    update: { startTime: new Date().toISOString(), endTime: null },
  });
  await prisma.productionOrder.update({ where: { id: op_id }, data: { recipeApproved: true } });
  res.json({ success: true });
});

router.post('/finish', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { op_id, notes } = req.body;
  if (!op_id) { res.status(400).json({ error: 'op_id obrigatório' }); return; }
  await prisma.poPesagem.update({
    where: { opId: op_id },
    data: { endTime: new Date().toISOString(), notes },
  });
  await prisma.productionOrder.update({ where: { id: op_id }, data: { recipeWeighed: true } });
  res.json({ success: true });
});

export default router;
