import { Router, Response } from 'express';
import { z } from 'zod';
import { addBusinessDays } from 'date-fns';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

const ItemSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('kg'),
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

// GET /api/production-orders/next-op-number
router.get('/next-op-number', async (_req, res: Response) => {
  const last = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });
  const next = last ? String(parseInt(last.opNumber) + 1).padStart(3, '0') : '001';
  res.json({ next_op_number: next });
});

// GET /api/production-orders
router.get('/', async (req: AuthRequest, res: Response) => {
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
  });
  res.json(ops);
});

// GET /api/production-orders/:id
router.get('/:id', async (req, res: Response) => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({
    where: { id },
    include: {
      sheet: true,
      activityLogs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const items = await prisma.productionOrder.findMany({
    where: { sheetId: op.sheetId },
    orderBy: { opNumber: 'asc' },
  });

  res.json({ ...op, items });
});

// GET /api/production-sheets/:sheetNumber
router.get('/sheet/:sheetNumber', async (req, res: Response) => {
  const sheet = await prisma.productionSheet.findUnique({
    where: { sheetNumber: req.params.sheetNumber },
    include: { productionOrders: { orderBy: { opNumber: 'asc' } } },
  });
  if (!sheet) { res.status(404).json({ error: 'Ficha não encontrada' }); return; }
  res.json(sheet);
});

// POST /api/production-orders
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = CreatePOSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const data = parsed.data;
  const userId = req.user!.id;

  const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' }, select: { sheetNumber: true } });
  const sheetNum = lastSheet ? parseInt(lastSheet.sheetNumber.split('-')[1]) + 1 : 1;
  const sheetNumber = `SHEET-${String(sheetNum).padStart(3, '0')}`;

  const entryDate = data.entry_date ? new Date(data.entry_date) : new Date();
  const expectedDate = data.expected_date ? new Date(data.expected_date) : addBusinessDays(entryDate, 5);

  const sheet = await prisma.productionSheet.create({
    data: {
      sheetNumber, client: data.client, color: data.color,
      orderNumber: data.order_number, description: data.description,
      entryDate, expectedDate, createdByUserId: userId,
    },
  });

  const lastOP = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' }, select: { opNumber: true } });
  let currentNum = lastOP ? parseInt(lastOP.opNumber) + 1 : 1;

  const createdOps: { id: number; op_number: string }[] = [];
  for (const item of data.items) {
    const opNumber = String(currentNum++).padStart(3, '0');
    const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';

    const op = await prisma.productionOrder.create({
      data: {
        sheetId: sheet.id, opNumber, client: data.client, color: data.color,
        orderNumber: data.order_number, entryDate, expectedDate,
        material: item.material, quantity: item.quantity, unit: item.unit,
        requiresLab: item.requires_lab, requiresFabricQuality: item.requires_fabric_quality,
        status: initialStatus, currentStage: 'almoxarifado',
        responsibleUserId: userId, description: data.description,
        regionJaragua: data.region_jaragua, regionBrusque: data.region_brusque, regionGaspar: data.region_gaspar,
        fiberId: data.fiber_id, isDualFiber: data.is_dual_fiber, fiber2Id: data.fiber2_id,
      },
    });

    await prisma.activityLog.create({
      data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId, details: `Criado por ${req.user!.name}` },
    });

    createdOps.push({ id: op.id, op_number: opNumber });
  }

  res.status(201).json({ op_number: createdOps[0].op_number, id: createdOps[0].id, sheet_id: sheet.id });
});

// PUT /api/production-orders/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = CreatePOSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const opId = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({ where: { id: opId } });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const data = parsed.data;
  const entryDate = data.entry_date ? new Date(data.entry_date) : new Date();
  const expectedDate = data.expected_date ? new Date(data.expected_date) : addBusinessDays(entryDate, 5);

  await prisma.productionSheet.update({
    where: { id: op.sheetId },
    data: { client: data.client, color: data.color, orderNumber: data.order_number, description: data.description, entryDate, expectedDate },
  });

  await prisma.activityLog.create({
    data: { opId, stage: 'almoxarifado', action: 'updated', userId: req.user!.id, details: `Atualizado por ${req.user!.name}` },
  });

  res.json({ success: true });
});

// DELETE /api/production-orders/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const opId = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({ where: { id: opId } });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  // Cascade delete via Prisma schema (onDelete: Cascade)
  await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
  await prisma.productionSheet.delete({ where: { id: op.sheetId } });

  res.json({ success: true });
});

// POST /api/op-start
router.post('/op-start', async (req, res: Response): Promise<void> => {
  const { op_id, stage, box_number, machine } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage são obrigatórios' }); return; }

  const existing = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (existing) { res.status(400).json({ error: 'OP já em andamento' }); return; }

  await prisma.poInProgress.create({ data: { opId: op_id, stage, boxNumber: box_number, machine } });
  res.json({ success: true });
});

// POST /api/op-stop
router.post('/op-stop', async (req, res: Response): Promise<void> => {
  const { op_id, stage } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage são obrigatórios' }); return; }

  const record = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (!record) { res.status(400).json({ error: 'OP não está em andamento' }); return; }

  await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
  res.json({ success: true, started_at: record.startedAt });
});

export default router;
