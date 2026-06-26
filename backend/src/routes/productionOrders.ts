import { Router, Response } from 'express';
import { addBusinessDays } from 'date-fns';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

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
  fiber_id: z.number().optional().nullable(),
  is_dual_fiber: z.boolean().default(false),
  fiber2_id: z.number().optional().nullable(),
  items: z.array(ItemSchema).min(1),
});

// Next OP number
router.get('/next-op-number', authMiddleware, async (_req: AuthRequest, res: Response) => {
  const last = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });
  const nextNum = last ? parseInt(last.opNumber.replace(/[^0-9]/g, '') || '0') + 1 : 1;
  res.json({ next_op_number: String(nextNum).padStart(3, '0') });
});

// List OPs
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { status, search, requires_lab } = req.query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (requires_lab === 'true') where.requiresLab = true;
  if (search) {
    where.OR = [
      { opNumber: { contains: search as string, mode: 'insensitive' } },
      { client: { contains: search as string, mode: 'insensitive' } },
      { color: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const ops = await prisma.productionOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { sheet: true, fiber1: true, fiber2: true },
  });

  res.json(ops);
});

// Get OP by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      sheet: true,
      fiber1: true,
      fiber2: true,
      activityLogs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });

  if (!op) {
    res.status(404).json({ error: 'OP não encontrada' });
    return;
  }

  const sheetOps = await prisma.productionOrder.findMany({
    where: { sheetId: op.sheetId },
    orderBy: { opNumber: 'asc' },
  });

  res.json({ ...op, items: sheetOps });
});

// Get sheet by sheet number
router.get('/sheet/:sheetNumber', authMiddleware, async (req: AuthRequest, res: Response) => {
  const sheet = await prisma.productionSheet.findUnique({
    where: { sheetNumber: req.params.sheetNumber },
    include: { productionOrders: { orderBy: { opNumber: 'asc' } } },
  });

  if (!sheet) {
    res.status(404).json({ error: 'Folha não encontrada' });
    return;
  }

  res.json(sheet);
});

// Create OP
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const validated = CreatePOSchema.parse(req.body);
  const userId = req.user!.id;

  const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' } });
  const sheetNum = lastSheet
    ? parseInt(lastSheet.sheetNumber.replace('SHEET-', '')) + 1
    : 1;
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

  const lastOP = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
  let currentNum = lastOP ? parseInt(lastOP.opNumber.replace(/[^0-9]/g, '') || '0') + 1 : 1;

  const createdOps = [];
  for (const item of validated.items) {
    const opNumber = String(currentNum).padStart(3, '0');
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

    createdOps.push(op);
    currentNum++;
  }

  res.status(201).json({ op_number: createdOps[0].opNumber, id: createdOps[0].id, sheet_id: sheet.id });
});

// Update OP
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const validated = CreatePOSchema.parse(req.body);
  const userId = req.user!.id;

  const op = await prisma.productionOrder.findUnique({ where: { id } });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
  const expectedDate = validated.expected_date ? new Date(validated.expected_date) : addBusinessDays(entryDate, 5);

  await prisma.productionSheet.update({
    where: { id: op.sheetId },
    data: { client: validated.client, color: validated.color, orderNumber: validated.order_number, description: validated.description, entryDate, expectedDate },
  });

  const oldOps = await prisma.productionOrder.findMany({ where: { sheetId: op.sheetId }, orderBy: { opNumber: 'asc' } });
  await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });

  let opIdx = 0;
  for (const item of validated.items) {
    const opNumber = opIdx < oldOps.length ? oldOps[opIdx].opNumber : String(Date.now()).slice(-3);
    const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';

    const newOp = await prisma.productionOrder.create({
      data: {
        sheetId: op.sheetId, opNumber, client: validated.client, color: validated.color,
        orderNumber: validated.order_number, entryDate, expectedDate, material: item.material,
        quantity: item.quantity, unit: item.unit, requiresLab: item.requires_lab,
        requiresFabricQuality: item.requires_fabric_quality, status: initialStatus,
        currentStage: 'almoxarifado', responsibleUserId: userId, description: validated.description,
        regionJaragua: validated.region_jaragua, regionBrusque: validated.region_brusque,
        regionGaspar: validated.region_gaspar, fiberId: validated.fiber_id,
        isDualFiber: validated.is_dual_fiber, fiber2Id: validated.fiber2_id,
      },
    });

    await prisma.activityLog.create({
      data: { opId: newOp.id, stage: 'almoxarifado', action: 'updated', userId, details: `Atualizado por ${req.user!.name}` },
    });
    opIdx++;
  }

  res.json({ success: true });
});

// Delete OP
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({ where: { id } });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  // Cascade delete handled by Prisma schema
  await prisma.productionSheet.delete({ where: { id: op.sheetId } });

  res.json({ success: true });
});

export default router;
