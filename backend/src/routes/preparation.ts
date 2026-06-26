import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const preparationSchema = z.object({
  po_id: z.number(),
  employee_meters: z.record(z.number()),
  start_time: z.string(),
  end_time: z.string(),
  splices: z.array(z.any()),
  total_weight: z.number(),
  destination_box: z.string(),
});

const batchSchema = z.object({
  color: z.string(),
  total_weight: z.number(),
  destination_box: z.string(),
  employee_meters: z.record(z.number()),
  splices: z.array(z.any()),
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

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = preparationSchema.parse(req.body);
    const userId = req.user!.id;
    const nextStatus = getNextStatus(validated.destination_box);

    await prisma.poPreparation.create({
      data: {
        opId: validated.po_id,
        employeeIds: validated.employee_meters,
        startTime: validated.start_time,
        endTime: validated.end_time,
        splices: validated.splices,
        totalWeight: validated.total_weight,
        destinationBox: validated.destination_box,
      },
    });

    await prisma.productionOrder.update({
      where: { id: validated.po_id },
      data: { status: nextStatus, currentStage: 'preparacao' },
    });

    await prisma.activityLog.create({
      data: { opId: validated.po_id, stage: 'preparacao', action: 'completed', userId },
    });

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/batch', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = batchSchema.parse(req.body);
    const userId = req.user!.id;

    const lastBatch = await prisma.preparationBatch.findFirst({ orderBy: { id: 'desc' } });
    const batchNumber = lastBatch
      ? `LOTE-${String(parseInt(lastBatch.batchNumber.split('-')[1]) + 1).padStart(3, '0')}`
      : 'LOTE-001';

    const batch = await prisma.preparationBatch.create({
      data: {
        batchNumber,
        color: validated.color,
        totalWeight: validated.total_weight,
        destinationBox: validated.destination_box,
        employeeIds: validated.employee_meters,
        splices: validated.splices,
        startTime: validated.start_time,
        endTime: validated.end_time,
      },
    });

    const nextStatus = getNextStatus(validated.destination_box);

    for (const op of validated.ops) {
      await prisma.batchOp.create({ data: { batchId: batch.id, opId: op.op_id, metersInBatch: op.meters } });

      await prisma.poPreparation.create({
        data: {
          opId: op.op_id,
          employeeIds: validated.employee_meters,
          startTime: validated.start_time,
          endTime: validated.end_time,
          splices: validated.splices,
          totalWeight: op.meters,
          destinationBox: validated.destination_box,
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
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/available-for-batch', authMiddleware, async (req, res): Promise<void> => {
  const { color } = req.query as { color: string };
  if (!color) { res.status(400).json({ error: 'Parâmetro color é obrigatório' }); return; }

  const ops = await prisma.productionOrder.findMany({
    where: { color, status: 'preparacao' },
    orderBy: { entryDate: 'asc' },
  });
  res.json(ops);
});

router.post('/create-lots', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const { parent_op_id, num_lots, lot_meters } = req.body;
    if (!parent_op_id || !num_lots || !lot_meters || lot_meters.length !== num_lots) {
      res.status(400).json({ error: 'Parâmetros inválidos' }); return;
    }

    const userId = req.user!.id;
    const parentOP = await prisma.productionOrder.findUnique({ where: { id: parent_op_id } });
    if (!parentOP) { res.status(404).json({ error: 'OP pai não encontrada' }); return; }

    const createdLots = [];
    for (let i = 0; i < num_lots; i++) {
      const lotNumber = i + 1;
      const meters = lot_meters[i];
      const newOPNumber = `${parentOP.opNumber}-L${lotNumber}`;

      const lot = await prisma.productionOrder.create({
        data: {
          sheetId: parentOP.sheetId,
          opNumber: newOPNumber,
          client: parentOP.client,
          color: parentOP.color,
          orderNumber: parentOP.orderNumber,
          entryDate: parentOP.entryDate,
          expectedDate: parentOP.expectedDate,
          material: parentOP.material,
          quantity: meters,
          unit: parentOP.unit,
          requiresLab: parentOP.requiresLab,
          status: 'preparacao',
          currentStage: 'preparacao',
          responsibleUserId: userId,
          createdByUserId: userId,
          description: parentOP.description,
          lotNumber,
          parentOpId: parent_op_id,
          lotMeters: meters,
        },
      });

      await prisma.activityLog.create({
        data: {
          opId: lot.id, stage: 'preparacao', action: 'lot_created', userId,
          details: `Lote ${lotNumber} de ${num_lots} criado a partir da OP ${parentOP.opNumber}`,
        },
      });

      createdLots.push({ id: lot.id, op_number: newOPNumber, lot_number: lotNumber });
    }

    await prisma.productionOrder.update({
      where: { id: parent_op_id },
      data: { status: 'concluido', isCompleted: true },
    });

    res.json({ success: true, lots: createdLots });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
