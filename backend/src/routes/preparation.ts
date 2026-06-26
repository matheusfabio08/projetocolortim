import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const PreparationSchema = z.object({
  po_id: z.number(),
  employee_meters: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.any(),
  total_weight: z.number(),
  destination_box: z.string(),
});

const BatchSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.any(),
  splices: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  ops: z.array(z.object({ op_id: z.number(), meters: z.number() })),
});

function destinationToStatus(dest: string): string {
  if (dest === 'Box 4') return 'box4';
  if (dest === 'Box 5') return 'box5';
  if (dest === 'Box 6') return 'box6';
  return 'producao';
}

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = PreparationSchema.parse(req.body);
  const userId = req.user!.id;

  await prisma.poPreparation.create({
    data: {
      opId: v.po_id,
      employeeIds: v.employee_meters,
      startTime: v.start_time,
      endTime: v.end_time,
      splices: v.splices,
      totalWeight: v.total_weight,
      destinationBox: v.destination_box,
    },
  });

  const nextStatus = destinationToStatus(v.destination_box);
  await prisma.productionOrder.update({
    where: { id: v.po_id },
    data: { status: nextStatus, currentStage: 'preparacao' },
  });

  await prisma.activityLog.create({
    data: { opId: v.po_id, stage: 'preparacao', action: 'completed', userId },
  });

  res.json({ success: true });
});

router.post('/batch', authMiddleware, async (req: AuthRequest, res: Response) => {
  const v = BatchSchema.parse(req.body);
  const userId = req.user!.id;

  const lastBatch = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' }, select: { batchNumber: true } });
  let batchNum = 1;
  if (lastBatch?.batchNumber) batchNum = parseInt(lastBatch.batchNumber.split('-')[1]) + 1;
  const batchNumber = `LOTE-${String(batchNum).padStart(3, '0')}`;

  const batch = await prisma.preparationBatch.create({
    data: {
      batchNumber,
      color: v.color,
      totalWeight: v.total_weight,
      destinationBox: v.destination_box,
      employeeIds: v.employee_meters,
      splices: v.splices,
      startTime: v.start_time,
      endTime: v.end_time,
    },
  });

  const nextStatus = destinationToStatus(v.destination_box);

  for (const op of v.ops) {
    await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });
    await prisma.poPreparation.create({
      data: {
        opId: op.op_id,
        employeeIds: v.employee_meters,
        startTime: v.start_time,
        endTime: v.end_time,
        splices: v.splices,
        totalWeight: op.meters,
        destinationBox: v.destination_box,
      },
    });
    await prisma.productionOrder.update({
      where: { id: op.op_id },
      data: { status: nextStatus, currentStage: 'preparacao' },
    });
    await prisma.activityLog.create({
      data: { opId: op.op_id, stage: 'preparacao', action: 'completed_in_batch', userId, details: `Lote ${batchNumber}` },
    });
  }

  res.json({ success: true, batch_number: batchNumber });
});

router.get('/available-for-batch', authMiddleware, async (req, res: Response) => {
  const { color } = req.query as { color?: string };
  if (!color) { res.status(400).json({ error: 'Parâmetro color obrigatório' }); return; }

  const ops = await prisma.productionOrder.findMany({
    where: { color, status: 'preparacao' },
    orderBy: { entryDate: 'asc' },
  });

  res.json(ops);
});

router.post('/create-lots', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { parent_op_id, num_lots, lot_meters } = req.body;
  const userId = req.user!.id;

  const parent = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
  if (!parent) { res.status(404).json({ error: 'OP pai não encontrada' }); return; }

  const lots = [];
  for (let i = 0; i < num_lots; i++) {
    const lotNumber = i + 1;
    const newOPNumber = `${parent.opNumber}-L${lotNumber}`;
    const lot = await prisma.productionOrder.create({
      data: {
        sheetId: parent.sheetId,
        opNumber: newOPNumber,
        client: parent.client,
        color: parent.color,
        orderNumber: parent.orderNumber,
        entryDate: parent.entryDate,
        expectedDate: parent.expectedDate,
        material: parent.material,
        quantity: lot_meters[i],
        unit: parent.unit,
        requiresLab: parent.requiresLab,
        status: 'preparacao',
        currentStage: 'preparacao',
        responsibleUserId: userId,
        description: parent.description,
        lotNumber,
        parentOpId: parent_op_id,
        lotMeters: lot_meters[i],
      },
    });
    await prisma.activityLog.create({
      data: { opId: lot.id, stage: 'preparacao', action: 'lot_created', userId, details: `Lote ${lotNumber} de ${num_lots} criado` },
    });
    lots.push({ id: lot.id, op_number: newOPNumber, lot_number: lotNumber });
  }

  await prisma.productionOrder.update({
    where: { id: parent_op_id },
    data: { status: 'concluido', isCompleted: true },
  });

  res.json({ success: true, lots });
});

export default router;
