import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const preparationRouter = Router();
preparationRouter.use(authMiddleware);

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

function nextStatus(box: string) {
  if (box === 'Box 4') return 'box4';
  if (box === 'Box 5') return 'box5';
  if (box === 'Box 6') return 'box6';
  return 'producao';
}

preparationRouter.post('/', async (req: AuthRequest, res) => {
  const v = PreparationSchema.parse(req.body);
  await prisma.poPreparation.create({
    data: {
      opId: v.po_id,
      employeeIds: JSON.stringify(v.employee_meters),
      startTime: v.start_time,
      endTime: v.end_time,
      splices: JSON.stringify(v.splices),
      totalWeight: v.total_weight,
      destinationBox: v.destination_box,
    },
  });
  await prisma.productionOrder.update({
    where: { id: v.po_id },
    data: { status: nextStatus(v.destination_box), currentStage: 'preparacao' },
  });
  await prisma.activityLog.create({
    data: { opId: v.po_id, stage: 'preparacao', action: 'completed', userId: req.user!.id },
  });
  return res.json({ success: true });
});

preparationRouter.post('/batch', async (req: AuthRequest, res) => {
  const v = BatchPreparationSchema.parse(req.body);
  const last = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' } });
  const n = last ? parseInt(last.batchNumber.split('-')[1]) + 1 : 1;
  const batchNumber = `LOTE-${String(n).padStart(3, '0')}`;

  const batch = await prisma.preparationBatch.create({
    data: {
      batchNumber,
      color: v.color,
      totalWeight: v.total_weight,
      destinationBox: v.destination_box,
      employeeIds: JSON.stringify(v.employee_meters),
      splices: JSON.stringify(v.splices),
      startTime: v.start_time,
      endTime: v.end_time,
    },
  });

  for (const op of v.ops) {
    await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });
    await prisma.poPreparation.upsert({
      where: { opId: op.op_id },
      create: { opId: op.op_id, employeeIds: JSON.stringify(v.employee_meters), startTime: v.start_time, endTime: v.end_time, splices: JSON.stringify(v.splices), totalWeight: op.meters, destinationBox: v.destination_box },
      update: { totalWeight: op.meters, destinationBox: v.destination_box },
    });
    await prisma.productionOrder.update({ where: { id: op.op_id }, data: { status: nextStatus(v.destination_box), currentStage: 'preparacao' } });
    await prisma.activityLog.create({ data: { opId: op.op_id, stage: 'preparacao', action: 'completed_in_batch', userId: req.user!.id, details: `Lote ${batchNumber}` } });
  }

  return res.json({ success: true, batch_number: batchNumber });
});

preparationRouter.get('/available-for-batch', async (req, res) => {
  const { color } = req.query as { color: string };
  if (!color) return res.status(400).json({ error: 'Parâmetro color obrigatório' });
  const ops = await prisma.productionOrder.findMany({ where: { color, status: 'preparacao' }, orderBy: { entryDate: 'asc' } });
  return res.json(ops);
});

preparationRouter.post('/create-lots', async (req: AuthRequest, res) => {
  const { parent_op_id, num_lots, lot_meters } = req.body;
  if (!parent_op_id || !num_lots || lot_meters?.length !== num_lots) return res.status(400).json({ error: 'Parâmetros inválidos' });

  const parent = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
  if (!parent) return res.status(404).json({ error: 'OP pai não encontrada' });

  const lots = [];
  for (let i = 0; i < num_lots; i++) {
    const op = await prisma.productionOrder.create({
      data: {
        sheetId: parent.sheetId,
        opNumber: `${parent.opNumber}-L${i + 1}`,
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
        responsibleUserId: req.user!.id,
        lotNumber: i + 1,
        parentOpId: parent_op_id,
        lotMeters: lot_meters[i],
      },
    });
    lots.push(op);
  }

  await prisma.productionOrder.update({ where: { id: parent_op_id }, data: { status: 'concluido', isCompleted: true } });
  return res.json({ success: true, lots });
});
