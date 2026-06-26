import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const pesagemRouter = Router();
pesagemRouter.use(authMiddleware);

pesagemRouter.get('/', async (_req, res) => {
  const list = await prisma.pesagemRecord.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(list);
});

pesagemRouter.post('/', async (req, res) => {
  const v = z.object({
    op_number: z.string(),
    client: z.string(),
    color: z.string(),
    weight: z.number(),
    employee_id: z.number().optional(),
    notes: z.string().optional(),
  }).parse(req.body);
  const record = await prisma.pesagemRecord.create({
    data: { opNumber: v.op_number, client: v.client, color: v.color, weight: v.weight, employeeId: v.employee_id, notes: v.notes },
  });
  return res.status(201).json(record);
});
