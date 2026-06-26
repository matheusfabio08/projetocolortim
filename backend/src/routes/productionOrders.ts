import { Router, Response } from 'express';
import { z } from 'zod';
import { addBusinessDays } from 'date-fns';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const ItemSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('KG'),
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

router.get('/next-op-number', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  const last = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });
  const next = last ? String(parseInt(last.opNumber.replace(/\D/g, '') || '0') + 1).padStart(3, '0') : '001';
  res.json({ next_op_number: next });
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search, requires_lab } = req.query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (requires_lab === 'true') where.requiresLab = true;
  if (search) {
    where.OR = [
      { opNumber: { contains: String(search), mode: 'insensitive' } },
      { client: { contains: String(search), mode: 'insensitive' } },
      { color: { contains: String(search), mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.productionOrder.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { sheet: true, responsibleUser: { select: { name: true } } },
  });
  res.json(orders);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const op = await prisma.productionOrder.findUnique({
    where: { id: parseInt(req.params.id) },
    include: {
      sheet: { include: { productionOrders: true } },
      activityLogs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
      responsibleUser: { select: { name: true } },
    },
  });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }
  res.json(op);
});

router.get('/sheet/:sheetNumber', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const sheet = await prisma.productionSheet.findUnique({
    where: { sheetNumber: req.params.sheetNumber },
    include: { productionOrders: true },
  });
  if (!sheet) { res.status(404).json({ error: 'Ficha não encontrada' }); return; }
  res.json(sheet);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const validated = CreatePOSchema.safeParse(req.body);
  if (!validated.success) { res.status(400).json({ error: validated.error.flatten() }); return; }
  const data = validated.data;

  const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' } });
  const sheetNum = lastSheet
    ? `SHEET-${String(parseInt(lastSheet.sheetNumber.split('-')[1]) + 1).padStart(3, '0')}`
    : 'SHEET-001';

  const entryDate = data.entry_date ? new Date(data.entry_date) : new Date();
  const expectedDate = data.expected_date ? new Date(data.expected_date) : addBusinessDays(entryDate, 5);

  const sheet = await prisma.productionSheet.create({
    data: {
      sheetNumber: sheetNum,
      client: data.client,
      color: data.color,
      orderNumber: data.order_number,
      description: data.description,
      entryDate,
      expectedDate,
      createdByUserId: req.user!.id,
    },
  });

  const lastOP = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
  let currentNum = lastOP ? parseInt(lastOP.opNumber.replace(/\D/g, '') || '0') + 1 : 1;

  const createdOps = [];
  for (const item of data.items) {
    const opNumber = String(currentNum++).padStart(3, '0');
    const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';

    const op = await prisma.productionOrder.create({
      data: {
        sheetId: sheet.id,
        opNumber,
        client: data.client,
        color: data.color,
        orderNumber: data.order_number,
        entryDate,
        expectedDate,
        material: item.material,
        quantity: item.quantity,
        unit: item.unit,
        requiresLab: item.requires_lab,
        requiresFabricQuality: item.requires_fabric_quality,
        status: initialStatus,
        currentStage: 'almoxarifado',
        responsibleUserId: req.user!.id,
        description: data.description,
        regionJaragua: data.region_jaragua,
        regionBrusque: data.region_brusque,
        regionGaspar: data.region_gaspar,
        fiberId: data.fiber_id,
        isDualFiber: data.is_dual_fiber,
        fiber2Id: data.fiber2_id,
      },
    });

    await prisma.activityLog.create({
      data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId: req.user!.id, details: `Criado por ${req.user!.name}` },
    });

    createdOps.push({ id: op.id, op_number: op.opNumber });
  }

  res.status(201).json({ op_number: createdOps[0].op_number, id: createdOps[0].id, sheet_id: sheet.id });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const op = await prisma.productionOrder.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  // Deleta toda a ficha e suas OPs (cascata configurada no schema)
  await prisma.productionSheet.delete({ where: { id: op.sheetId } });
  res.json({ success: true });
});

router.post('/op-start', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { op_id, stage, box_number, machine } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage são obrigatórios' }); return; }

  const existing = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (existing) { res.status(400).json({ error: 'OP já em progresso' }); return; }

  await prisma.poInProgress.create({ data: { opId: op_id, stage, boxNumber: box_number, machine } });
  res.json({ success: true, started_at: new Date().toISOString() });
});

router.post('/op-stop', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { op_id, stage } = req.body;
  if (!op_id || !stage) { res.status(400).json({ error: 'op_id e stage são obrigatórios' }); return; }

  const inProgress = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: op_id, stage } } });
  if (!inProgress) { res.status(400).json({ error: 'OP não está em progresso' }); return; }

  await prisma.poInProgress.delete({ where: { opId_stage: { opId: op_id, stage } } });
  res.json({ success: true, started_at: inProgress.startedAt, stopped_at: new Date().toISOString() });
});

export default router;
