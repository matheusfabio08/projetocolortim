import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { sector } = req.query as { sector?: string };
    const where: any = { isActive: true };
    if (sector && sector !== 'Todos') where.sector = sector;
    const employees = await prisma.employee.findMany({ where, orderBy: [{ sector: 'asc' }, { name: 'asc' }] });
    res.json(employees);
  } catch { res.status(500).json({ error: 'Erro ao buscar funcionários' }); }
});

router.post('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { name, sector } = z.object({ name: z.string().min(1), sector: z.string() }).parse(req.body);
    await prisma.employee.create({ data: { name, sector } });
    res.status(201).json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
});

router.put('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, sector, is_active } = req.body;
    await prisma.employee.update({ where: { id }, data: { name, sector, isActive: is_active } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao atualizar funcionário' }); }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.employee.delete({ where: { id } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao excluir funcionário' }); }
});

export default router;
