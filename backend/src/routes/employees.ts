import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const schema = z.object({ name: z.string().min(1), sector: z.string().min(1) });

router.get('/', authMiddleware, async (req, res): Promise<void> => {
  const { sector } = req.query as { sector?: string };
  const where: Record<string, unknown> = { isActive: true };
  if (sector && sector !== 'Todos') where.sector = sector;
  const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
  res.json(employees);
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.employee.create({ data: { name: v.name, sector: v.sector } });
    res.status(201).json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.put('/:id', authMiddleware, async (req, res): Promise<void> => {
  const { name, sector, is_active } = req.body;
  await prisma.employee.update({ where: { id: parseInt(req.params.id) }, data: { name, sector, isActive: is_active } });
  res.json({ success: true });
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
