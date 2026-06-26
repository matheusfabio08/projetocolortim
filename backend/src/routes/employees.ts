import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const EmployeeSchema = z.object({
  name: z.string().min(1),
  sector: z.string().min(1),
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { sector } = req.query;
  const where: Record<string, unknown> = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = { in: [sector, 'Todos'] };

  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  res.json(employees);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = EmployeeSchema.parse(req.body);
  await prisma.employee.create({ data: { name: v.name, sector: v.sector } });
  res.status(201).json({ success: true });
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({ where: { id: parseInt(req.params.id) }, data: { name, sector, isActive: is_active } });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
