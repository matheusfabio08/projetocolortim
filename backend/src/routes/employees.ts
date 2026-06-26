import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { sector } = req.query;
  const where: any = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = { in: [String(sector), 'Todos'] };
  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  return res.json(employees);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, sector } = z.object({ name: z.string().min(1), sector: z.string().min(1) }).parse(req.body);
    await prisma.employee.create({ data: { name, sector } });
    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({ where: { id: parseInt(req.params.id) }, data: { name, sector, isActive: is_active } });
  return res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  return res.json({ success: true });
});

export default router;
