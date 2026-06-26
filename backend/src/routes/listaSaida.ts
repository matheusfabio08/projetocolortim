import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.use(authMiddleware);
router.get('/', async (_req, res) => res.json(await (prisma as any).listaSaida.findMany({ orderBy: { createdAt: 'desc' } })));
router.post('/', async (req, res) => { const r = await (prisma as any).listaSaida.create({ data: req.body }); res.status(201).json(r); });
router.delete('/:id', async (req, res) => { await (prisma as any).listaSaida.delete({ where: { id: parseInt(req.params.id) } }); res.json({ success: true }); });
export default router;
