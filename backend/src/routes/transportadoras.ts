import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const items = await prisma.transportadora.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  return res.json(items);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, cnpj, contact } = req.body;
  const item = await prisma.transportadora.create({ data: { name, cnpj, contact } });
  return res.status(201).json(item);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.transportadora.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  return res.json({ success: true });
});

export default router;
