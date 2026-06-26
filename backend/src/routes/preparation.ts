import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

const PreparationSchema = z.object({
  po_id: z.number(),
  employee_meters: z.any(),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.any().default([]),
  total_weight: z.number(),
  destination_box: z.string(),
});

const BatchSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.any(),
  splices: z.any().default([]),
  start_time: z.string(),
  end_time: z.string(),
  ops: z.array(z.object({ op_id: z.number(), meters: z.number() })),
});

function nextStatus(destination: string): string {
  if (destination === 'Box 4') return 'box4';
  if (destination === 'Box 5') return 'box5';
  if (destination === 'Box 6') return 'box6';
  return 'producao';
}

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = PreparationSchema.parse(req.body);
    const user = req.user!;
    await prisma.poPreparation.create({
      data: {
        opId: validated.po_id, employeeIds: validated.employee_meters,
        startTime: validated.start_time, endTime: validated.end_time,
        splices: validated.splices, totalWeight: validated.total_weight,
        destinationBox: validated.destination_box,
      },
    });
    await prisma.productionOrder.update({
      where: { id: validated.po_id },
      data: { status: nextStatus(validated.destination_box), currentStage: 'preparacao' },
    });
    await prisma.activityLog.create({ data: { opId: validated.po_id, stage: 'preparacao', action: 'completed', userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro na preparação' });
  }
});

router.post('/batch', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = BatchSchema.parse(req.body);
    const user = req.user!;

    const lastBatch = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' }, select: { batchNumber: true } });
    let batchNum = 1;
    if (lastBatch?.batchNumber) batchNum = parseInt(lastBatch.batchNumber.split('-')[1] || '0') + 1;
    const batchNumber = `LOTE-${String(batchNum).padStart(3, '0')}`;

    const batch = await prisma.preparationBatch.create({
      data: {
        batchNumber, color: validated.color, totalWeight: validated.total_weight,
        destinationBox: validated.destination_box, employeeIds: validated.employee_meters,
        splices: validated.splices, startTime: validated.start_time, endTime: validated.end_time,
      },
    });

    for (const op of validated.ops) {
      await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });
      await prisma.poPreparation.create({
        data: {
          opId: op.op_id, employeeIds: validated.employee_meters,
          startTime: validated.start_time, endTime: validated.end_time,
          splices: validated.splices, totalWeight: op.meters, destinationBox: validated.destination_box,
        },
      });
      await prisma.productionOrder.update({
        where: { id: op.op_id },
        data: { status: nextStatus(validated.destination_box), currentStage: 'preparacao' },
      });
      await prisma.activityLog.create({ data: { opId: op.op_id, stage: 'preparacao', action: 'completed_in_batch', userId: user.id, details: `Lote ${batchNumber}` } });
    }

    res.json({ success: true, batch_number: batchNumber });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro no lote de preparação' });
  }
});

router.get('/available-for-batch', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { color } = req.query as { color?: string };
    if (!color) { res.status(400).json({ error: 'Parâmetro color obrigatório' }); return; }
    const ops = await prisma.productionOrder.findMany({
      where: { color, status: 'preparacao' },
      orderBy: { entryDate: 'asc' },
    });
    res.json(ops);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar OPs disponíveis' });
  }
});

router.post('/create-lots', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { parent_op_id, num_lots, lot_meters } = req.body;
    const user = req.user!;
    if (!parent_op_id || !num_lots || !lot_meters || lot_meters.length !== num_lots) {
      res.status(400).json({ error: 'Parâmetros inválidos' }); return;
    }
    const parentOP = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
    if (!parentOP) { res.status(404).json({ error: 'OP não encontrada' }); return; }

    const createdLots = [];
    for (let i = 0; i < num_lots; i++) {
      const lot = await prisma.productionOrder.create({
        data: {
          sheetId: parentOP.sheetId, opNumber: `${parentOP.opNumber}-L${i + 1}`,
          client: parentOP.client, color: parentOP.color, orderNumber: parentOP.orderNumber,
          entryDate: parentOP.entryDate, expectedDate: parentOP.expectedDate,
          material: parentOP.material, quantity: lot_meters[i], unit: parentOP.unit,
          requiresLab: parentOP.requiresLab, status: 'preparacao', currentStage: 'preparacao',
          responsibleUserId: user.id, description: parentOP.description,
          lotNumber: i + 1, parentOpId: parent_op_id, lotMeters: lot_meters[i],
        },
      });
      await prisma.activityLog.create({ data: { opId: lot.id, stage: 'preparacao', action: 'lot_created', userId: user.id, details: `Lote ${i + 1} de ${num_lots}` } });
      createdLots.push(lot);
    }
    await prisma.productionOrder.update({ where: { id: parent_op_id }, data: { isCompleted: true, status: 'concluido' } });
    res.json({ success: true, lots: createdLots });
  } catch {
    res.status(500).json({ error: 'Erro ao criar lotes' });
  }
});

export default router;
