import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const waiting = await prisma.productionOrder.findMany({
      where: { requiresLab: true, lotNumber: null, parentOpId: null, recipeWeighed: false, pesagem: null },
      include: { laboratory: true },
      orderBy: { createdAt: 'desc' },
    });
    const inProgress = await prisma.productionOrder.findMany({
      where: { requiresLab: true, pesagem: { isCompleted: false } },
      include: { pesagem: true },
    });
    const completed = await prisma.productionOrder.findMany({
      where: { requiresLab: true, recipeWeighed: true },
      include: { pesagem: true },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    res.json({ waiting, inProgress, completed });
  } catch { res.status(500).json({ error: 'Erro ao buscar pesagem' }); }
});

router.post('/start', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { op_id, employee_id } = req.body;
    await prisma.poPesagem.create({ data: { opId: op_id, employeeId: employee_id, isCompleted: false } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao iniciar pesagem' }); }
});

router.post('/complete', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { op_id, end_time, observations } = req.body;
    await prisma.poPesagem.update({
      where: { opId: op_id },
      data: { endTime: end_time, observations, isCompleted: true },
    });
    await prisma.productionOrder.update({ where: { id: op_id }, data: { recipeWeighed: true } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao completar pesagem' }); }
});

export default router;
