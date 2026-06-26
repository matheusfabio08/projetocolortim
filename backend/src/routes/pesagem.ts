import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  const [waiting, inProgress, completed] = await Promise.all([
    prisma.productionOrder.findMany({
      where: { requiresLab: true, lotNumber: null, parentOpId: null, recipeWeighed: false, pesagem: null },
      include: { laboratory: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.productionOrder.findMany({
      where: { requiresLab: true, pesagem: { startTime: { not: null }, endTime: null } },
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

router.post('/start', authMiddleware, async (req, res): Promise<void> => {
  const { op_id } = req.body;
  if (!op_id) { res.status(400).json({ error: 'op_id é obrigatório' }); return; }
  await prisma.productionOrder.update({ where: { id: op_id }, data: { recipeApproved: true } });
  await prisma.poPesagem.create({ data: { opId: op_id, startTime: new Date() } });
  res.status(201).json({ success: true });
});

router.post('/finish', authMiddleware, async (req, res): Promise<void> => {
  const { op_id, employee_id, notes } = req.body;
  if (!op_id || !employee_id) { res.status(400).json({ error: 'op_id e employee_id são obrigatórios' }); return; }
  await prisma.poPesagem.updateMany({
    where: { opId: op_id, endTime: null },
    data: { endTime: new Date(), employeeId: employee_id, notes },
  });
  await prisma.productionOrder.update({ where: { id: op_id }, data: { recipeWeighed: true } });
  res.json({ success: true });
});

export default router;
