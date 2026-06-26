import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const lists = await prisma.exitList.findMany({
    include: { transporter: true, items: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(lists);
});

router.post('/', async (req, res: Response) => {
  const last = await prisma.exitList.findFirst({ orderBy: { id: 'desc' }, select: { listNumber: true } });
  const num = last ? parseInt(last.listNumber.split('-')[1]) + 1 : 1;
  const listNumber = `LS-${String(num).padStart(4, '0')}`;

  const list = await prisma.exitList.create({
    data: {
      listNumber,
      transporterId: req.body.transporter_id,
      driverName: req.body.driver_name,
      vehiclePlate: req.body.vehicle_plate,
      exitDate: new Date(req.body.exit_date),
      notes: req.body.notes,
      items: { create: req.body.items || [] },
    },
    include: { items: true },
  });
  res.status(201).json(list);
});

router.delete('/:id', async (req, res: Response) => {
  await prisma.exitList.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
