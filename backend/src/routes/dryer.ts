import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const schema = z.object({ po_id: z.number(), destination: z.string() });

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.poDryer.create({ data: { opId: v.po_id, destination: v.destination } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: v.destination, currentStage: 'secadora' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'secadora', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/records', authMiddleware, async (_req, res): Promise<void> => {
  const ops = await prisma.productionOrder.findMany({ where: { status: 'secadora' }, orderBy: { entryDate: 'asc' } });
  res.json(ops);
});

export default router;
