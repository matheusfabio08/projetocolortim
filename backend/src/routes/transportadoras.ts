import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.use(authMiddleware);
router.get('/', async (_req, res) => res.json(await prisma.transportadora.findMany({ orderBy: { name: 'asc' } })));
router.post('/', async (req, res) => { await prisma.transportadora.create({ data: { name: req.body.name } }); res.status(201).json({ success: true }); });
router.delete('/:id', async (req, res) => { await prisma.transportadora.delete({ where: { id: parseInt(req.params.id) } }); res.json({ success: true }); });
export default router;
