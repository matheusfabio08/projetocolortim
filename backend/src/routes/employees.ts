import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

export const employeesRouter = Router();
employeesRouter.use(authMiddleware);

employeesRouter.get('/', async (req, res) => {
  const { sector } = req.query as { sector?: string };
  const where: any = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = sector;
  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  return res.json(employees);
});

employeesRouter.post('/', async (req, res) => {
  const v = z.object({ name: z.string().min(1), sector: z.string().min(1) }).parse(req.body);
  await prisma.employee.create({ data: { name: v.name, sector: v.sector } });
  return res.status(201).json({ success: true });
});

employeesRouter.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({ where: { id }, data: { name, sector, isActive: is_active } });
  return res.json({ success: true });
});

employeesRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await prisma.employee.delete({ where: { id } });
  return res.json({ success: true });
});
