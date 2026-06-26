import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const items = await prisma.listaSaida.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(items);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { op_number, client, color, total_meters, transportadora_id, notes, exit_date } = req.body;
    const item = await prisma.listaSaida.create({ data: { opNumber: op_number, client, color, totalMeters: total_meters, transportadoraId: transportadora_id, notes, exitDate: exit_date } });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar lista de saída' });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.listaSaida.delete({ where: { id: parseInt(req.params.id) } });
  return res.json({ success: true });
});

export default router;
