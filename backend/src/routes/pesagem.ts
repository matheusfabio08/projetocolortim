import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.use(authMiddleware);

router.get('/records', async (_req, res) => {
  const waiting = await prisma.productionOrder.findMany({
    where: { requiresLab: true, lotNumber: null, parentOpId: null, recipeWeighed: false, pesagem: null },
    include: { laboratory: true },
    orderBy: { createdAt: 'desc' },
  });
  const inProgress = await prisma.productionOrder.findMany({
    where: { requiresLab: true, pesagem: { startTime: { not: null }, endTime: null } },
    include: { pesagem: true },
  });
  const completed = await prisma.productionOrder.findMany({
    where: { requiresLab: true, pesagem: { endTime: { not: null } } },
    include: { pesagem: true },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
  res.json({ waiting, inProgress, completed });
});

router.post('/start', async (req, res) => {
  const { op_id, start_time } = req.body;
  await prisma.poPesagem.create({ data: { opId: op_id, startTime: start_time } });
  res.json({ success: true });
});

router.post('/finish', async (req, res): Promise<void> => {
  const { op_id, end_time } = req.body;
  const p = await prisma.poPesagem.findUnique({ where: { opId: op_id } });
  if (!p) { res.status(404).json({ error: 'Pesagem não encontrada' }); return; }
  await prisma.poPesagem.update({ where: { opId: op_id }, data: { endTime: end_time } });
  await prisma.productionOrder.update({ where: { id: op_id }, data: { recipeWeighed: true } });
  res.json({ success: true });
});

export default router;
