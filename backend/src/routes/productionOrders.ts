import { Router, Response } from 'express';
import { z } from 'zod';
import { addBusinessDays } from 'date-fns';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const ItemSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('metros'),
  requires_lab: z.boolean().default(false),
  requires_fabric_quality: z.boolean().default(false),
});

const CreatePOSchema = z.object({
  client: z.string().min(1),
  color: z.string().min(1),
  order_number: z.string().optional(),
  description: z.string().optional(),
  entry_date: z.string().optional(),
  expected_date: z.string().optional(),
  region_jaragua: z.boolean().default(false),
  region_brusque: z.boolean().default(false),
  region_gaspar: z.boolean().default(false),
  fiber_id: z.number().optional(),
  is_dual_fiber: z.boolean().default(false),
  fiber2_id: z.number().optional(),
  items: z.array(ItemSchema).min(1),
});

// GET next OP number
router.get('/next-op-number', authMiddleware, async (_req, res: Response) => {
  const lastOP = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });

  let nextNum = 1;
  if (lastOP?.opNumber) {
    const base = lastOP.opNumber.split('-')[0];
    nextNum = parseInt(base) + 1;
  }

  res.json({ next_op_number: String(nextNum).padStart(3, '0') });
});

// GET all OPs
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { status, search, requires_lab } = req.query as Record<string, string>;

  const where: any = {};
  if (status) where.status = status;
  if (requires_lab === 'true') where.requiresLab = true;
  if (search) {
    where.OR = [
      { opNumber: { contains: search, mode: 'insensitive' } },
      { client: { contains: search, mode: 'insensitive' } },
      { color: { contains: search, mode: 'insensitive' } },
    ];
  }

  const ops = await prisma.productionOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { fiber: true, fiber2: true },
  });

  res.json(ops);
});

// GET single OP
router.get('/:id', authMiddleware, async (req, res: Response) => {
  const op = await prisma.productionOrder.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      sheet: true,
      activityLog: { orderBy: { createdAt: 'asc' } },
      fiber: true,
      fiber2: true,
    },
  });

  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const items = await prisma.productionOrder.findMany({
    where: { sheetId: op.sheetId },
    orderBy: { opNumber: 'asc' },
  });

  res.json({
    ...op,
    items: items.map(i => ({
      id: i.id,
      material: i.material,
      quantity: i.quantity,
      unit: i.unit,
      individual_op: i.opNumber,
      requires_lab: i.requiresLab,
    })),
  });
});

// POST create OP
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const validated = CreatePOSchema.parse(req.body);
  const userId = req.user!.id;

  // Generate sheet number
  const lastSheet = await prisma.productionSheet.findFirst({
    orderBy: { id: 'desc' },
    select: { sheetNumber: true },
  });

  let sheetNum = 1;
  if (lastSheet?.sheetNumber) {
    sheetNum = parseInt(lastSheet.sheetNumber.split('-')[1]) + 1;
  }
  const sheetNumber = `SHEET-${String(sheetNum).padStart(3, '0')}`;

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
      createdById: userId,
    },
  });

  // Get last OP number
  const lastOP = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });

  let currentNum = 1;
  if (lastOP?.opNumber) {
    currentNum = parseInt(lastOP.opNumber.split('-')[0]) + 1;
  }

  const createdOps = [];
  for (let i = 0; i < validated.items.length; i++) {
    const item = validated.items[i];
    const opNumber = String(currentNum + i).padStart(3, '0');
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
        description: validated.description,
        regionJaragua: validated.region_jaragua,
        regionBrusque: validated.region_brusque,
        regionGaspar: validated.region_gaspar,
        fiberId: validated.fiber_id,
        isDualFiber: validated.is_dual_fiber,
        fiber2Id: validated.fiber2_id,
      },
    });

    await prisma.activityLog.create({
      data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId, details: `Criado por ${req.user!.name}` },
    });

    createdOps.push({ id: op.id, op_number: opNumber });
  }

  res.status(201).json({ op_number: createdOps[0].op_number, id: createdOps[0].id, sheet_id: sheet.id });
});

// PUT update OP
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const validated = CreatePOSchema.parse(req.body);
  const userId = req.user!.id;

  const op = await prisma.productionOrder.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
  const expectedDate = validated.expected_date
    ? new Date(validated.expected_date)
    : addBusinessDays(entryDate, 5);

  await prisma.productionSheet.update({
    where: { id: op.sheetId },
    data: { client: validated.client, color: validated.color, orderNumber: validated.order_number, description: validated.description, entryDate, expectedDate },
  });

  const oldOps = await prisma.productionOrder.findMany({
    where: { sheetId: op.sheetId },
    orderBy: { opNumber: 'asc' },
    select: { opNumber: true },
  });

  await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });

  let currentNum = 1;
  const lastOP = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' }, select: { opNumber: true } });
  if (lastOP?.opNumber) currentNum = parseInt(lastOP.opNumber.split('-')[0]) + 1;

  for (let i = 0; i < validated.items.length; i++) {
    const item = validated.items[i];
    const opNumber = i < oldOps.length ? oldOps[i].opNumber : String(currentNum++).padStart(3, '0');
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
        description: validated.description,
        regionJaragua: validated.region_jaragua,
        regionBrusque: validated.region_brusque,
        regionGaspar: validated.region_gaspar,
        fiberId: validated.fiber_id,
        isDualFiber: validated.is_dual_fiber,
        fiber2Id: validated.fiber2_id,
      },
    });

    await prisma.activityLog.create({
      data: { opId: newOp.id, stage: 'almoxarifado', action: 'updated', userId, details: `Atualizado por ${req.user!.name}` },
    });
  }

  res.json({ success: true });
});

// DELETE OP
router.delete('/:id', authMiddleware, async (req, res: Response) => {
  const op = await prisma.productionOrder.findUnique({
    where: { id: parseInt(req.params.id) },
  });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  // Cascade via Prisma relations (all child records deleted automatically)
  await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
  await prisma.productionSheet.delete({ where: { id: op.sheetId } });

  res.json({ success: true });
});

export default router;
