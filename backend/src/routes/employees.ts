import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
router.use(authMiddleware);
const Schema = z.object({ name: z.string().min(1), sector: z.string().min(1) });
router.get('/', async (req, res) => {
  const { sector } = req.query;
  const where: any = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = String(sector);
  res.json(await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] }));
});
router.post('/', async (req, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.employee.create({ data: { name: v.name, sector: v.sector } });
    res.status(201).json({ success: true });
  } catch { res.status(400).json({ error: 'Dados inválidos' }); }
});
router.put('/:id', async (req, res) => {
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({ where: { id: parseInt(req.params.id) }, data: { name, sector, isActive: is_active } });
  res.json({ success: true });
});
router.delete('/:id', async (req, res) => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});
export default router;
