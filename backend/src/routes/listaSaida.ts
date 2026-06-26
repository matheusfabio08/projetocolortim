import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const listaSaidaRouter = Router();
listaSaidaRouter.use(authMiddleware);

listaSaidaRouter.get('/', async (_req, res) => {
  const list = await prisma.listaSaida.findMany({ orderBy: { sentAt: 'desc' } });
  return res.json(list);
});

listaSaidaRouter.post('/', async (req, res) => {
  const v = z.object({
    op_number: z.string(),
    client: z.string(),
    color: z.string(),
    meters: z.number(),
    rolls: z.number(),
    destination: z.string().optional(),
    carrier: z.string().optional(),
    notes: z.string().optional(),
  }).parse(req.body);
  const record = await prisma.listaSaida.create({
    data: { opNumber: v.op_number, client: v.client, color: v.color, meters: v.meters, rolls: v.rolls, destination: v.destination, carrier: v.carrier, notes: v.notes },
  });
  return res.status(201).json(record);
});
