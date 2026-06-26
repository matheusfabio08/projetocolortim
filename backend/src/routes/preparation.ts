import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();
router.use(authMiddleware);

const PreparationSchema = z.object({
  po_id: z.number(),
  employee_meters: z.record(z.string(), z.number()),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.array(z.any()),
  total_weight: z.number(),
  destination_box: z.string(),
});

const BatchSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.record(z.string(), z.number()),
  splices: z.array(z.any()),
  start_time: z.string(),
  end_time: z.string(),
  ops: z.array(z.object({ op_id: z.number(), meters: z.number() })),
});

function getNextStatus(destinationBox: string) {
  if (destinationBox === 'Box 4') return 'box4';
  if (destinationBox === 'Box 5') return 'box5';
  if (destinationBox === 'Box 6') return 'box6';
  return 'producao';
}

// POST single
router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = PreparationSchema.parse(req.body);
    const nextStatus = getNextStatus(v.destination_box);

    await prisma.poPreparation.create({ data: { opId: v.po_id, employeeIds: v.employee_meters, startTime: v.start_time, endTime: v.end_time, splices: v.splices, totalWeight: v.total_weight, destinationBox: v.destination_box } });
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: nextStatus, currentStage: 'preparacao' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'preparacao', action: 'completed', userId: req.user!.id } });
    res.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});

// POST batch
router.post('/batch', async (req: AuthRequest, res): Promise<void> => {
  try {
    const v = BatchSchema.parse(req.body);
    const nextStatus = getNextStatus(v.destination_box);

    const lastBatch = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' } });
    const num = lastBatch ? parseInt(lastBatch.batchNumber.split('-')[1]) + 1 : 1;
    const batchNumber = `LOTE-${String(num).padStart(3, '0')}`;

    const batch = await prisma.preparationBatch.create({
      data: { batchNumber, color: v.color, totalWeight: v.total_weight, destinationBox: v.destination_box, employeeIds: v.employee_meters, splices: v.splices, startTime: v.start_time, endTime: v.end_time },
    });

    for (const op of v.ops) {
      await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });
      await prisma.poPreparation.create({ data: { opId: op.op_id, employeeIds: v.employee_meters, startTime: v.start_time, endTime: v.end_time, splices: v.splices, totalWeight: op.meters, destinationBox: v.destination_box } });
      await prisma.productionOrder.update({ where: { id: op.op_id }, data: { status: nextStatus, currentStage: 'preparacao' } });
      await prisma.activityLog.create({ data: { opId: op.op_id, stage: 'preparacao', action: 'completed_in_batch', userId: req.user!.id, details: `Lote ${batchNumber}` } });
    }
    res.json({ success: true, batch_number: batchNumber });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});

// GET available for batch
router.get('/available-for-batch', async (req, res) => {
  const { color } = req.query;
  if (!color) { res.status(400).json({ error: 'Color obrigatório' }); return; }
  const ops = await prisma.productionOrder.findMany({ where: { color: String(color), status: 'preparacao' }, orderBy: { entryDate: 'asc' } });
  res.json(ops);
});

// POST create lots
router.post('/create-lots', async (req: AuthRequest, res): Promise<void> => {
  const { parent_op_id, num_lots, lot_meters } = req.body;
  if (!parent_op_id || !num_lots || !lot_meters || lot_meters.length !== num_lots) {
    res.status(400).json({ error: 'Parâmetros inválidos' }); return;
  }

  const parent = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
  if (!parent) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const lots = [];
  for (let i = 0; i < num_lots; i++) {
    const op = await prisma.productionOrder.create({
      data: { sheetId: parent.sheetId, opNumber: `${parent.opNumber}-L${i + 1}`, client: parent.client, color: parent.color, orderNumber: parent.orderNumber, entryDate: parent.entryDate, expectedDate: parent.expectedDate, material: parent.material, quantity: lot_meters[i], unit: parent.unit, requiresLab: parent.requiresLab, status: 'preparacao', currentStage: 'preparacao', responsibleUserId: req.user!.id, description: parent.description, lotNumber: i + 1, parentOpId: parent_op_id, lotMeters: lot_meters[i] },
    });
    await prisma.activityLog.create({ data: { opId: op.id, stage: 'preparacao', action: 'lot_created', userId: req.user!.id, details: `Lote ${i + 1} de ${num_lots} criado a partir da OP ${parent.opNumber}` } });
    lots.push({ id: op.id, op_number: op.opNumber, lot_number: i + 1 });
  }

  await prisma.productionOrder.update({ where: { id: parent_op_id }, data: { status: 'concluido', isCompleted: true } });
  await prisma.activityLog.create({ data: { opId: parent_op_id, stage: 'preparacao', action: 'split_into_lots', userId: req.user!.id, details: `Dividida em ${num_lots} lotes` } });

  res.json({ success: true, lots });
});

export default router;
