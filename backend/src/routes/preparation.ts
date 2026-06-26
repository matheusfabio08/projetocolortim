import { Router, Response } from 'express';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

const PrepSchema = z.object({
  po_id: z.number(),
  employee_meters: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.any(),
  total_weight: z.number(),
  destination_box: z.string(),
});

const BatchPrepSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.any(),
  splices: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  ops: z.array(z.object({ op_id: z.number(), meters: z.number() })),
});

function getNextStatus(destinationBox: string): string {
  if (destinationBox === 'Box 4') return 'box4';
  if (destinationBox === 'Box 5') return 'box5';
  if (destinationBox === 'Box 6') return 'box6';
  return 'producao';
}

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = PrepSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;

    await prisma.poPreparation.create({
      data: { opId: v.po_id, employeeIds: v.employee_meters, startTime: v.start_time, endTime: v.end_time, splices: v.splices, totalWeight: v.total_weight, destinationBox: v.destination_box },
    });

    const nextStatus = getNextStatus(v.destination_box);
    await prisma.productionOrder.update({ where: { id: v.po_id }, data: { status: nextStatus, currentStage: 'preparacao' } });
    await prisma.activityLog.create({ data: { opId: v.po_id, stage: 'preparacao', action: 'completed', userId: user.id } });

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro na preparação' });
  }
});

router.post('/batch', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = BatchPrepSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const v = result.data;
    const user = req.user!;

    const lastBatch = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' } });
    const batchNum = lastBatch ? parseInt(lastBatch.batchNumber.split('-')[1]) + 1 : 1;
    const batchNumber = `LOTE-${String(batchNum).padStart(3, '0')}`;

    const batch = await prisma.preparationBatch.create({
      data: { batchNumber, color: v.color, totalWeight: v.total_weight, destinationBox: v.destination_box, employeeIds: v.employee_meters, splices: v.splices, startTime: v.start_time, endTime: v.end_time },
    });

    const nextStatus = getNextStatus(v.destination_box);

    for (const op of v.ops) {
      await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });
      await prisma.poPreparation.create({ data: { opId: op.op_id, employeeIds: v.employee_meters, startTime: v.start_time, endTime: v.end_time, splices: v.splices, totalWeight: op.meters, destinationBox: v.destination_box } });
      await prisma.productionOrder.update({ where: { id: op.op_id }, data: { status: nextStatus, currentStage: 'preparacao' } });
      await prisma.activityLog.create({ data: { opId: op.op_id, stage: 'preparacao', action: 'completed_in_batch', userId: user.id, details: `Lote ${batchNumber}` } });
    }

    return res.json({ success: true, batch_number: batchNumber });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no lote de preparação' });
  }
});

router.get('/available-for-batch', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { color } = req.query;
  if (!color) return res.status(400).json({ error: 'Parâmetro color obrigatório' });
  const ops = await prisma.productionOrder.findMany({ where: { color: String(color), status: 'preparacao' }, orderBy: { entryDate: 'asc' } });
  return res.json(ops);
});

router.post('/create-lots', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { parent_op_id, num_lots, lot_meters } = req.body;
    if (!parent_op_id || !num_lots || !lot_meters || lot_meters.length !== num_lots) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }
    const user = req.user!;
    const parent = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
    if (!parent) return res.status(404).json({ error: 'OP pai não encontrada' });

    const lots: any[] = [];
    for (let i = 0; i < num_lots; i++) {
      const lot = await prisma.productionOrder.create({
        data: {
          sheetId: parent.sheetId, opNumber: `${parent.opNumber}-L${i + 1}`,
          client: parent.client, color: parent.color, orderNumber: parent.orderNumber,
          entryDate: parent.entryDate, expectedDate: parent.expectedDate,
          material: parent.material, quantity: lot_meters[i], unit: parent.unit,
          requiresLab: parent.requiresLab, status: 'preparacao', currentStage: 'preparacao',
          responsibleUserId: user.id, description: parent.description,
          lotNumber: i + 1, parentOpId: parent_op_id, lotMeters: lot_meters[i],
        },
      });
      await prisma.activityLog.create({ data: { opId: lot.id, stage: 'preparacao', action: 'lot_created', userId: user.id, details: `Lote ${i + 1} de ${num_lots} de OP ${parent.opNumber}` } });
      lots.push({ id: lot.id, op_number: lot.opNumber, lot_number: i + 1 });
    }

    await prisma.productionOrder.update({ where: { id: parent_op_id }, data: { status: 'concluido', isCompleted: true } });
    await prisma.activityLog.create({ data: { opId: parent_op_id, stage: 'preparacao', action: 'split_into_lots', userId: user.id, details: `Dividida em ${num_lots} lotes` } });

    return res.json({ success: true, lots });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar lotes' });
  }
});

export default router;
