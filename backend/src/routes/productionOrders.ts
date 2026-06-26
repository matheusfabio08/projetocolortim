import { Router } from 'express';
import { z } from 'zod';
import { addBusinessDays } from 'date-fns';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const itemSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('m'),
  requires_lab: z.boolean().default(false),
  requires_fabric_quality: z.boolean().default(false),
});

const createPOSchema = z.object({
  client: z.string().min(1),
  color: z.string().min(1),
  order_number: z.string().optional(),
  description: z.string().optional(),
  entry_date: z.string().optional(),
  expected_date: z.string().optional(),
  region_jaragua: z.boolean().default(false),
  region_brusque: z.boolean().default(false),
  region_gaspar: z.boolean().default(false),
  fiber_id: z.number().optional().nullable(),
  is_dual_fiber: z.boolean().default(false),
  fiber2_id: z.number().optional().nullable(),
  carrier_id: z.number().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

// Helper to generate sequential OP number
async function getNextOpNumber(): Promise<string> {
  const last = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });
  if (!last) return '001';
  const num = parseInt(last.opNumber.replace(/-L\d+$/, ''));
  return String(isNaN(num) ? 1 : num + 1).padStart(3, '0');
}

async function getNextSheetNumber(): Promise<string> {
  const last = await prisma.productionSheet.findFirst({
    orderBy: { id: 'desc' },
    select: { sheetNumber: true },
  });
  if (!last) return 'SHEET-001';
  const num = parseInt(last.sheetNumber.split('-')[1]);
  return `SHEET-${String(isNaN(num) ? 1 : num + 1).padStart(3, '0')}`;
}

router.get('/next-op-number', authMiddleware, async (_req, res): Promise<void> => {
  const next = await getNextOpNumber();
  res.json({ next_op_number: next });
});

router.get('/', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { status, search, requires_lab } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (requires_lab === 'true') where.requiresLab = true;
    if (search) {
      where.OR = [
        { opNumber: { contains: search, mode: 'insensitive' } },
        { client: { contains: search, mode: 'insensitive' } },
        { color: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.productionOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { fiber: true, fiber2: true, carrier: true },
    });

    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const op = await prisma.productionOrder.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        sheet: true,
        fiber: true,
        fiber2: true,
        carrier: true,
        activityLogs: { orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true } } } },
        lots: true,
        parentOp: { select: { id: true, opNumber: true } },
      },
    });
    if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

    const items = await prisma.productionOrder.findMany({
      where: { sheetId: op.sheetId },
      orderBy: { opNumber: 'asc' },
      select: { id: true, opNumber: true, material: true, quantity: true, unit: true, requiresLab: true },
    });

    res.json({ ...op, items });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/sheet/:sheetNumber', authMiddleware, async (req, res): Promise<void> => {
  try {
    const sheet = await prisma.productionSheet.findUnique({
      where: { sheetNumber: req.params.sheetNumber },
      include: { orders: { orderBy: { opNumber: 'asc' } } },
    });
    if (!sheet) { res.status(404).json({ error: 'Ficha não encontrada' }); return; }
    res.json(sheet);
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = createPOSchema.parse(req.body);
    const userId = req.user!.id;

    const sheetNumber = await getNextSheetNumber();
    const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
    const expectedDate = validated.expected_date
      ? new Date(validated.expected_date)
      : addBusinessDays(entryDate, 5);

    const sheet = await prisma.productionSheet.create({
      data: {
        sheetNumber,
        client: validated.client,
        color: validated.color,
        orderNumber: validated.order_number,
        description: validated.description,
        entryDate,
        expectedDate,
        createdByUser: userId,
      },
    });

    let currentOpNum = parseInt(await getNextOpNumber());
    const createdOps: { id: number; op_number: string }[] = [];

    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      const opNumber = String(currentOpNum + i).padStart(3, '0');
      const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';

      const op = await prisma.productionOrder.create({
        data: {
          sheetId: sheet.id,
          opNumber,
          client: validated.client,
          color: validated.color,
          orderNumber: validated.order_number,
          entryDate,
          expectedDate,
          material: item.material,
          quantity: item.quantity,
          unit: item.unit,
          requiresLab: item.requires_lab,
          requiresFabricQuality: item.requires_fabric_quality,
          status: initialStatus,
          currentStage: 'almoxarifado',
          responsibleUserId: userId,
          createdByUserId: userId,
          description: validated.description,
          regionJaragua: validated.region_jaragua,
          regionBrusque: validated.region_brusque,
          regionGaspar: validated.region_gaspar,
          fiberId: validated.fiber_id,
          isDualFiber: validated.is_dual_fiber,
          fiber2Id: validated.fiber2_id,
          carrierId: validated.carrier_id,
        },
      });

      await prisma.activityLog.create({
        data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId, details: `Criado por ${req.user!.name}` },
      });

      createdOps.push({ id: op.id, op_number: opNumber });
    }

    res.status(201).json({ op_number: createdOps[0].op_number, id: createdOps[0].id, sheet_id: sheet.id });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = createPOSchema.parse(req.body);
    const userId = req.user!.id;
    const opId = parseInt(req.params.id);

    const op = await prisma.productionOrder.findUnique({ where: { id: opId } });
    if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

    const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
    const expectedDate = validated.expected_date
      ? new Date(validated.expected_date)
      : addBusinessDays(entryDate, 5);

    await prisma.productionSheet.update({
      where: { id: op.sheetId },
      data: {
        client: validated.client,
        color: validated.color,
        orderNumber: validated.order_number,
        description: validated.description,
        entryDate,
        expectedDate,
      },
    });

    const oldOps = await prisma.productionOrder.findMany({
      where: { sheetId: op.sheetId },
      orderBy: { opNumber: 'asc' },
      select: { opNumber: true },
    });

    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });

    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      let opNumber: string;
      if (i < oldOps.length) {
        opNumber = oldOps[i].opNumber;
      } else {
        opNumber = String(parseInt(await getNextOpNumber())).padStart(3, '0');
      }

      const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';
      const newOp = await prisma.productionOrder.create({
        data: {
          sheetId: op.sheetId,
          opNumber,
          client: validated.client,
          color: validated.color,
          orderNumber: validated.order_number,
          entryDate,
          expectedDate,
          material: item.material,
          quantity: item.quantity,
          unit: item.unit,
          requiresLab: item.requires_lab,
          requiresFabricQuality: item.requires_fabric_quality,
          status: initialStatus,
          currentStage: 'almoxarifado',
          responsibleUserId: userId,
          createdByUserId: userId,
          description: validated.description,
          regionJaragua: validated.region_jaragua,
          regionBrusque: validated.region_brusque,
          regionGaspar: validated.region_gaspar,
          fiberId: validated.fiber_id,
          isDualFiber: validated.is_dual_fiber,
          fiber2Id: validated.fiber2_id,
          carrierId: validated.carrier_id,
        },
      });

      await prisma.activityLog.create({
        data: { opId: newOp.id, stage: 'almoxarifado', action: 'updated', userId, details: `Atualizado por ${req.user!.name}` },
      });
    }

    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const opId = parseInt(req.params.id);
    const op = await prisma.productionOrder.findUnique({ where: { id: opId } });
    if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
    await prisma.productionSheet.delete({ where: { id: op.sheetId } });

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// OP start/stop in-progress
router.post('/op-start', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { op_id, stage, box_number, machine } = req.body;
    if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage são obrigatórios' }); return; }

    const existing = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: parseInt(op_id), stage } } });
    if (existing) { res.status(400).json({ error: 'OP já em andamento' }); return; }

    await prisma.poInProgress.create({ data: { opId: parseInt(op_id), stage, boxNumber: box_number, machine } });
    res.json({ success: true, started_at: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.post('/op-stop', authMiddleware, async (req, res): Promise<void> => {
  try {
    const { op_id, stage } = req.body;
    const inProgress = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: parseInt(op_id), stage } } });
    if (!inProgress) { res.status(400).json({ error: 'OP não está em andamento' }); return; }

    await prisma.poInProgress.delete({ where: { opId_stage: { opId: parseInt(op_id), stage } } });
    res.json({ success: true, started_at: inProgress.startedAt, stopped_at: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.get('/op-status/:id/:stage', authMiddleware, async (req, res): Promise<void> => {
  try {
    const inProgress = await prisma.poInProgress.findUnique({
      where: { opId_stage: { opId: parseInt(req.params.id), stage: req.params.stage } },
    });
    res.json({ in_progress: !!inProgress, started_at: inProgress?.startedAt ?? null, box_number: inProgress?.boxNumber ?? null });
  } catch {
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
