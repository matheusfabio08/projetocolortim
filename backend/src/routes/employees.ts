import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const Schema = z.object({ name: z.string().min(2), sector: z.string().min(1) });

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { sector } = req.query;
  const where: Record<string, unknown> = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = sector;
  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  res.json(employees);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const v = Schema.safeParse(req.body);
  if (!v.success) { res.status(400).json({ error: v.error.flatten() }); return; }
  await prisma.employee.create({ data: v.data });
  res.status(201).json({ success: true });
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({
    where: { id: parseInt(req.params.id) },
    data: { name, sector, isActive: is_active },
  });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
