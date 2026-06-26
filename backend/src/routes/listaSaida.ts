import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const items = await prisma.listaSaida.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch { res.status(500).json({ error: 'Erro ao buscar lista de saída' }); }
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const data = z.object({
      op_number: z.string(), client: z.string(), color: z.string(),
      quantity: z.number(), unit: z.string(),
      carrier_id: z.number().optional(), carrier_name: z.string().optional(),
      exit_date: z.string(), observations: z.string().optional(),
    }).parse(req.body);
    const item = await prisma.listaSaida.create({
      data: {
        opNumber: data.op_number, client: data.client, color: data.color,
        quantity: data.quantity, unit: data.unit, carrierId: data.carrier_id,
        carrierName: data.carrier_name, exitDate: data.exit_date, observations: data.observations,
      },
    });
    res.status(201).json(item);
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro ao criar item de saída' });
  }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.listaSaida.delete({ where: { id } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao excluir item' }); }
});

export default router;
