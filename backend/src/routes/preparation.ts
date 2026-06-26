import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const PreparationSchema = z.object({
  po_id: z.number(),
  employee_meters: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.any(),
  total_weight: z.number(),
  destination_box: z.string(),
});

const BatchPreparationSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.any(),
  splices: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  ops: z.array(z.object({ op_id: z.number(), meters: z.number() })),
});

const nextStatus = (box: string) => {
  if (box === 'Box 4') return 'box4';
  if (box === 'Box 5') return 'box5';
  if (box === 'Box 6') return 'box6';
  return 'producao';
};

// POST /api/preparation
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = PreparationSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  await prisma.poPreparation.create({
    data: {
      opId: d.po_id, employeeIds: d.employee_meters, startTime: d.start_time,
      endTime: d.end_time, splices: d.splices, totalWeight: d.total_weight,
      destinationBox: d.destination_box,
    },
  });

  await prisma.productionOrder.update({
    where: { id: d.po_id },
    data: { status: nextStatus(d.destination_box), currentStage: 'preparacao' },
  });

  await prisma.activityLog.create({
    data: { opId: d.po_id, stage: 'preparacao', action: 'completed', userId: req.user!.id },
  });

  res.json({ success: true });
});

// POST /api/preparation/batch
router.post('/batch', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = BatchPreparationSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }
  const d = parsed.data;

  const lastBatch = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' }, select: { batchNumber: true } });
  const num = lastBatch ? parseInt(lastBatch.batchNumber.split('-')[1]) + 1 : 1;
  const batchNumber = `LOTE-${String(num).padStart(3, '0')}`;

  const batch = await prisma.preparationBatch.create({
    data: {
      batchNumber, color: d.color, totalWeight: d.total_weight,
      destinationBox: d.destination_box, employeeIds: d.employee_meters,
      splices: d.splices, startTime: d.start_time, endTime: d.end_time,
    },
  });

  for (const op of d.ops) {
    await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });
    await prisma.poPreparation.create({
      data: {
        opId: op.op_id, employeeIds: d.employee_meters, startTime: d.start_time,
        endTime: d.end_time, splices: d.splices, totalWeight: op.meters,
        destinationBox: d.destination_box,
      },
    });
    await prisma.productionOrder.update({
      where: { id: op.op_id },
      data: { status: nextStatus(d.destination_box), currentStage: 'preparacao' },
    });
    await prisma.activityLog.create({
      data: { opId: op.op_id, stage: 'preparacao', action: 'completed_in_batch', userId: req.user!.id, details: `Lote ${batchNumber}` },
    });
  }

  res.json({ success: true, batch_number: batchNumber });
});

// GET /api/preparation/available-for-batch
router.get('/available-for-batch', async (req, res: Response) => {
  const color = req.query.color as string;
  if (!color) { res.status(400).json({ error: 'Parâmetro color obrigatório' }); return; }
  const ops = await prisma.productionOrder.findMany({
    where: { color, status: 'preparacao' },
    orderBy: { entryDate: 'asc' },
  });
  res.json(ops);
});

// POST /api/preparation/create-lots
router.post('/create-lots', async (req: AuthRequest, res: Response): Promise<void> => {
  const { parent_op_id, num_lots, lot_meters } = req.body;
  if (!parent_op_id || !num_lots || !lot_meters || lot_meters.length !== num_lots) {
    res.status(400).json({ error: 'Parâmetros inválidos' }); return;
  }

  const parent = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
  if (!parent) { res.status(404).json({ error: 'OP pai não encontrada' }); return; }

  const createdLots = [];
  for (let i = 0; i < num_lots; i++) {
    const op = await prisma.productionOrder.create({
      data: {
        sheetId: parent.sheetId, opNumber: `${parent.opNumber}-L${i + 1}`,
        client: parent.client, color: parent.color, orderNumber: parent.orderNumber,
        entryDate: parent.entryDate, expectedDate: parent.expectedDate,
        material: parent.material, quantity: lot_meters[i], unit: parent.unit,
        requiresLab: parent.requiresLab, status: 'preparacao', currentStage: 'preparacao',
        responsibleUserId: req.user!.id, description: parent.description,
        lotNumber: i + 1, parentOpId: parent_op_id, lotMeters: lot_meters[i],
      },
    });
    createdLots.push({ id: op.id, op_number: op.opNumber, lot_number: i + 1 });
    await prisma.activityLog.create({
      data: { opId: op.id, stage: 'preparacao', action: 'lot_created', userId: req.user!.id, details: `Lote ${i + 1} de ${num_lots}` },
    });
  }

  await prisma.productionOrder.update({
    where: { id: parent_op_id },
    data: { status: 'concluido', isCompleted: true },
  });

  res.json({ success: true, lots: createdLots });
});

export default router;
