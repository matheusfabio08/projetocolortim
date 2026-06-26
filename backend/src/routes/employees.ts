import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const Schema = z.object({ name: z.string().min(1), sector: z.string().min(1) });

router.get('/', async (req, res: Response) => {
  const sector = req.query.sector as string;
  const where: any = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = sector;
  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  res.json(employees);
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = Schema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  await prisma.employee.create({ data: { name: parsed.data.name, sector: parsed.data.sector } });
  res.status(201).json({ success: true });
});

router.put('/:id', async (req, res: Response) => {
  const id = parseInt(req.params.id);
  await prisma.employee.update({ where: { id }, data: { name: req.body.name, sector: req.body.sector, isActive: req.body.is_active } });
  res.json({ success: true });
});

router.delete('/:id', async (req, res: Response) => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
