import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { addBusinessDays } from 'date-fns';
import { z } from 'zod';

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
  fiber_id: z.number().optional().nullable(),
  is_dual_fiber: z.boolean().default(false),
  fiber2_id: z.number().optional().nullable(),
  items: z.array(ItemSchema).min(1),
});

// GET next OP number
router.get('/next-op-number', async (_req, res) => {
  const last = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
  const next = last ? String(parseInt(last.opNumber) + 1).padStart(3, '0') : '001';
  res.json({ next_op_number: next });
});

// GET all
router.get('/', async (req, res) => {
  const { status, search, requires_lab } = req.query;
  const where: any = {};
  if (status) where.status = status;
  if (requires_lab === 'true') where.requiresLab = true;
  if (search) {
    where.OR = [
      { opNumber: { contains: String(search), mode: 'insensitive' } },
      { client: { contains: String(search), mode: 'insensitive' } },
      { color: { contains: String(search), mode: 'insensitive' } },
    ];
  }
  const orders = await prisma.productionOrder.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

// GET by ID
router.get('/:id', async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({
    where: { id },
    include: { activityLogs: { orderBy: { createdAt: 'asc' } } },
  });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  const items = await prisma.productionOrder.findMany({
    where: { sheetId: op.sheetId },
    orderBy: { opNumber: 'asc' },
  });

  res.json({ ...op, items: items.map(i => ({ id: i.id, material: i.material, quantity: i.quantity, unit: i.unit, individual_op: i.opNumber, requires_lab: i.requiresLab })) });
});

// GET production sheet by sheet number
router.get('/sheet/:sheetNumber', async (req, res): Promise<void> => {
  const sheet = await prisma.productionSheet.findUnique({ where: { sheetNumber: req.params.sheetNumber } });
  if (!sheet) { res.status(404).json({ error: 'Ficha não encontrada' }); return; }
  const ops = await prisma.productionOrder.findMany({ where: { sheetId: sheet.id }, orderBy: { opNumber: 'asc' } });
  res.json({ ...sheet, items: ops.map(o => ({ material: o.material, quantity: o.quantity, unit: o.unit, individual_op: o.opNumber })) });
});

// POST create
router.post('/', async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = CreatePOSchema.parse(req.body);
    const user = req.user!;

    const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' } });
    const sheetNum = lastSheet ? parseInt(lastSheet.sheetNumber.split('-')[1]) + 1 : 1;
    const sheetNumber = `SHEET-${String(sheetNum).padStart(3, '0')}`;

    const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
    const expectedDate = validated.expected_date ? new Date(validated.expected_date) : addBusinessDays(entryDate, 5);

    const sheet = await prisma.productionSheet.create({
      data: { sheetNumber, client: validated.client, color: validated.color, orderNumber: validated.order_number, description: validated.description, entryDate, expectedDate, createdByUserId: user.id },
    });

    const lastOP = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
    let currentNum = lastOP ? parseInt(lastOP.opNumber) + 1 : 1;

    const created = [];
    for (const item of validated.items) {
      const opNumber = String(currentNum++).padStart(3, '0');
      const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';
      const op = await prisma.productionOrder.create({
        data: {
          sheetId: sheet.id, opNumber, client: validated.client, color: validated.color, orderNumber: validated.order_number,
          entryDate, expectedDate, material: item.material, quantity: item.quantity, unit: item.unit,
          requiresLab: item.requires_lab, requiresFabricQuality: item.requires_fabric_quality,
          status: initialStatus, currentStage: 'almoxarifado', responsibleUserId: user.id,
          description: validated.description,
          regionJaragua: validated.region_jaragua, regionBrusque: validated.region_brusque, regionGaspar: validated.region_gaspar,
          fiberId: validated.fiber_id, isDualFiber: validated.is_dual_fiber, fiber2Id: validated.fiber2_id,
        },
      });
      await prisma.activityLog.create({ data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId: user.id, details: `Criado por ${user.name}` } });
      created.push({ id: op.id, op_number: opNumber });
    }

    res.status(201).json({ op_number: created[0].op_number, id: created[0].id, sheet_id: sheet.id });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: e.errors }); return; }
    console.error(e);
    res.status(500).json({ error: 'Erro ao criar OP' });
  }
});

// DELETE
router.delete('/:id', async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({ where: { id } });
  if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }

  // Cascade delete (Prisma handles via onDelete: Cascade)
  await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
  await prisma.productionSheet.delete({ where: { id: op.sheetId } });
  res.json({ success: true });
});

export default router;
