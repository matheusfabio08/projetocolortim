import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const schema = z.object({
  op_id: z.number(),
  op_number: z.string(),
  client: z.string(),
  color: z.string(),
  quantity: z.number(),
  unit: z.string(),
  notes: z.string().optional().nullable(),
});

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  const records = await prisma.listaSaida.findMany({ orderBy: { exitDate: 'desc' } });
  res.json(records);
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    const record = await prisma.listaSaida.create({
      data: { opId: v.op_id, opNumber: v.op_number, client: v.client, color: v.color, quantity: v.quantity, unit: v.unit, notes: v.notes },
    });
    res.status(201).json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  await prisma.listaSaida.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
