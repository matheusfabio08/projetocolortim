import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({
  op_id: z.number(),
  client_name: z.string(),
  color: z.string(),
  quantity: z.number(),
  unit: z.string(),
  transportadora: z.string().optional(),
  notes: z.string().optional(),
  exit_date: z.string(),
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const records = await prisma.listaSaida.findMany({
    include: { op: true },
    orderBy: { exitDate: 'desc' },
  });
  res.json(records);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  const d = v.data;
  const record = await prisma.listaSaida.create({
    data: { opId: d.op_id, clientName: d.client_name, color: d.color, quantity: d.quantity, unit: d.unit, transportadora: d.transportadora, notes: d.notes, exitDate: new Date(d.exit_date) },
  });
  res.status(201).json(record);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.listaSaida.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
