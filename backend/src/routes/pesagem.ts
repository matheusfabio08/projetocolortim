import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req, res: Response) => {
  const records = await prisma.weighingRecord.findMany({ orderBy: { weighedAt: 'desc' } });
  res.json(records);
});

router.post('/', async (req, res: Response) => {
  const { op_number, client, color, weight_in, weight_out, employee_name, notes } = req.body;
  const record = await prisma.weighingRecord.create({
    data: {
      opNumber: op_number, client, color, weightIn: weight_in,
      weightOut: weight_out, difference: weight_out ? weight_out - weight_in : null,
      employeeName: employee_name, notes,
    },
  });
  res.status(201).json(record);
});

router.put('/:id', async (req, res: Response) => {
  const { weight_out, notes } = req.body;
  const existing = await prisma.weighingRecord.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!existing) { res.status(404).json({ error: 'Registro não encontrado' }); return; }
  await prisma.weighingRecord.update({
    where: { id: parseInt(req.params.id) },
    data: { weightOut: weight_out, difference: weight_out - existing.weightIn, notes },
  });
  res.json({ success: true });
});

export default router;
