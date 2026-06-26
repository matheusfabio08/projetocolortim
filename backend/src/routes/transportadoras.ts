import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const t = await prisma.transporter.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(t);
});

router.post('/', async (req, res: Response) => {
  await prisma.transporter.create({ data: { name: req.body.name, contact: req.body.contact } });
  res.status(201).json({ success: true });
});

router.put('/:id', async (req, res: Response) => {
  await prisma.transporter.update({ where: { id: parseInt(req.params.id) }, data: req.body });
  res.json({ success: true });
});

export default router;
