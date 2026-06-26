import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({ name: z.string().min(1), sector: z.string().min(1) });

router.get('/', async (req, res: Response) => {
  const { sector } = req.query as { sector?: string };
  const where: any = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = sector;
  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  res.json(employees);
});

router.post('/', async (req, res: Response) => {
  const v = Schema.parse(req.body);
  await prisma.employee.create({ data: { name: v.name, sector: v.sector } });
  res.status(201).json({ success: true });
});

router.put('/:id', async (req, res: Response) => {
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({
    where: { id: parseInt(req.params.id) },
    data: { name, sector, isActive: is_active },
  });
  res.json({ success: true });
});

router.delete('/:id', async (req, res: Response) => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
