import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const ListaSaidaSchema = z.object({
  op_number: z.string().min(1),
  client: z.string().min(1),
  color: z.string().min(1),
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('metros'),
  transportadora_id: z.number().optional().nullable(),
  notes: z.string().optional(),
  exit_date: z.string().min(1),
});

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const result = await prisma.listaSaida.findMany({ include: { transportadora: true }, orderBy: { exitDate: 'desc' } });
  res.json(result);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = ListaSaidaSchema.parse(req.body);
  await prisma.listaSaida.create({
    data: { opNumber: v.op_number, client: v.client, color: v.color, material: v.material, quantity: v.quantity, unit: v.unit, transportadoraId: v.transportadora_id, notes: v.notes, exitDate: new Date(v.exit_date) },
  });
  res.status(201).json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.listaSaida.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
