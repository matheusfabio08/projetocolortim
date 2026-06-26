import { Router } from 'express';
import { addBusinessDays } from 'date-fns';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const productionOrdersRouter = Router();
productionOrdersRouter.use(authMiddleware);

const ItemSchema = z.object({
  material: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().default('kg'),
  requires_lab: z.boolean().optional().default(false),
  requires_fabric_quality: z.boolean().optional().default(false),
});

const CreatePOSchema = z.object({
  client: z.string().min(1),
  color: z.string().min(1),
  order_number: z.string().optional(),
  description: z.string().optional(),
  entry_date: z.string().optional(),
  expected_date: z.string().optional(),
  region_jaragua: z.boolean().optional().default(false),
  region_brusque: z.boolean().optional().default(false),
  region_gaspar: z.boolean().optional().default(false),
  fiber_id: z.number().optional(),
  is_dual_fiber: z.boolean().optional().default(false),
  fiber2_id: z.number().optional(),
  items: z.array(ItemSchema).min(1),
});

// Helper para gerar próximo número
async function nextSheetNumber() {
  const last = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' } });
  if (!last) return 'SHEET-001';
  const n = parseInt(last.sheetNumber.split('-')[1]) + 1;
  return `SHEET-${String(n).padStart(3, '0')}`;
}

async function nextOpNumber() {
  const last = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
  if (!last) return 1;
  return parseInt(last.opNumber.replace(/-L\d+$/, '')) + 1;
}

productionOrdersRouter.get('/', async (req, res) => {
  const { status, search, requires_lab } = req.query as Record<string, string>;
  const where: any = {};
  if (status) where.status = status;
  if (requires_lab === 'true') where.requiresLab = true;
  if (search) where.OR = [
    { opNumber: { contains: search, mode: 'insensitive' } },
    { client: { contains: search, mode: 'insensitive' } },
    { color: { contains: search, mode: 'insensitive' } },
  ];
  const ops = await prisma.productionOrder.findMany({ where, orderBy: { createdAt: 'desc' } });
  return res.json(ops);
});

productionOrdersRouter.get('/next-op-number', async (_req, res) => {
  const n = await nextOpNumber();
  return res.json({ next_op_number: String(n).padStart(3, '0') });
});

productionOrdersRouter.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({
    where: { id },
    include: { activityLogs: { orderBy: { createdAt: 'asc' } } },
  });
  if (!op) return res.status(404).json({ error: 'OP não encontrada' });
  const items = await prisma.productionOrder.findMany({ where: { sheetId: op.sheetId }, orderBy: { opNumber: 'asc' } });
  return res.json({ ...op, items });
});

productionOrdersRouter.post('/', async (req: AuthRequest, res) => {
  const validated = CreatePOSchema.parse(req.body);
  const user = req.user!;
  const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
  const expectedDate = validated.expected_date ? new Date(validated.expected_date) : addBusinessDays(entryDate, 5);
  const sheetNumber = await nextSheetNumber();
  let currentOpNum = await nextOpNumber();

  const sheet = await prisma.productionSheet.create({
    data: {
      sheetNumber,
      client: validated.client,
      color: validated.color,
      orderNumber: validated.order_number,
      description: validated.description,
      entryDate,
      expectedDate,
      createdByUserId: user.id,
    },
  });

  const createdOps = [];
  for (const item of validated.items) {
    const opNumber = String(currentOpNum).padStart(3, '0');
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
        requiresLab: item.requires_lab ?? false,
        requiresFabricQuality: item.requires_fabric_quality ?? false,
        status: initialStatus,
        currentStage: 'almoxarifado',
        responsibleUserId: user.id,
        description: validated.description,
        regionJaragua: validated.region_jaragua ?? false,
        regionBrusque: validated.region_brusque ?? false,
        regionGaspar: validated.region_gaspar ?? false,
        fiberId: validated.fiber_id,
        isDualFiber: validated.is_dual_fiber ?? false,
        fiber2Id: validated.fiber2_id,
      },
    });
    await prisma.activityLog.create({
      data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId: user.id, details: `Criado por ${user.name}` },
    });
    createdOps.push(op);
    currentOpNum++;
  }

  return res.status(201).json({ op_number: createdOps[0].opNumber, id: createdOps[0].id, sheet_id: sheet.id });
});

productionOrdersRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const op = await prisma.productionOrder.findUnique({ where: { id } });
  if (!op) return res.status(404).json({ error: 'OP não encontrada' });
  await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
  await prisma.productionSheet.delete({ where: { id: op.sheetId } });
  return res.json({ success: true });
});
