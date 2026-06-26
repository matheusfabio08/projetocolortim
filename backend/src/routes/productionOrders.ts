import { Router } from 'express';
import { addBusinessDays } from 'date-fns';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

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

router.get('/next-op-number', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const lastOP = await prisma.productionOrder.findFirst({
      orderBy: { id: 'desc' },
      select: { opNumber: true },
    });
    let nextOPNumber = '001';
    if (lastOP?.opNumber) {
      const lastNum = parseInt(lastOP.opNumber.replace(/\D/g, '')) || 0;
      nextOPNumber = String(lastNum + 1).padStart(3, '0');
    }
    res.json({ next_op_number: nextOPNumber });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar próximo número de OP' });
  }
});

router.get('/', authMiddleware, async (req, res): Promise<void> => {
  try {
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
    const orders = await prisma.productionOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ordens de produção' });
  }
});

router.get('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const op = await prisma.productionOrder.findUnique({
      where: { id },
      include: { activityLogs: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'asc' } } },
    });
    if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }
    const items = await prisma.productionOrder.findMany({
      where: { sheetId: op.sheetId },
      orderBy: { opNumber: 'asc' },
    });
    res.json({ ...op, items: items.map(i => ({ id: i.id, material: i.material, quantity: i.quantity, unit: i.unit, individual_op: i.opNumber, requires_lab: i.requiresLab })) });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar OP' });
  }
});

router.get('/sheet/:sheetNumber', authMiddleware, async (req, res): Promise<void> => {
  try {
    const sheet = await prisma.productionSheet.findUnique({ where: { sheetNumber: req.params.sheetNumber } });
    if (!sheet) { res.status(404).json({ error: 'Ficha não encontrada' }); return; }
    const ops = await prisma.productionOrder.findMany({ where: { sheetId: sheet.id }, orderBy: { opNumber: 'asc' } });
    res.json({ ...sheet, op_number: sheet.sheetNumber, items: ops.map(op => ({ material: op.material, quantity: op.quantity, unit: op.unit, individual_op: op.opNumber })) });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ficha' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    const validated = CreatePOSchema.parse(req.body);
    const user = req.user!;

    const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' }, select: { sheetNumber: true } });
    let sheetNum = 1;
    if (lastSheet?.sheetNumber) sheetNum = parseInt(lastSheet.sheetNumber.split('-')[1] || '0') + 1;
    const sheetNumber = `SHEET-${String(sheetNum).padStart(3, '0')}`;

    const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
    const expectedDate = validated.expected_date ? new Date(validated.expected_date) : addBusinessDays(entryDate, 5);

    const sheet = await prisma.productionSheet.create({
      data: {
        sheetNumber, client: validated.client, color: validated.color,
        orderNumber: validated.order_number, description: validated.description,
        entryDate, expectedDate, createdByUserId: user.id,
      },
    });

    const lastOP = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' }, select: { opNumber: true } });
    let currentOPNum = parseInt(lastOP?.opNumber?.replace(/\D/g, '') || '0') + 1;

    const createdOps = [];
    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      const opNumber = String(currentOPNum + i).padStart(3, '0');
      const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';
      const op = await prisma.productionOrder.create({
        data: {
          sheetId: sheet.id, opNumber, client: validated.client, color: validated.color,
          orderNumber: validated.order_number, entryDate, expectedDate,
          material: item.material, quantity: item.quantity, unit: item.unit,
          requiresLab: item.requires_lab, requiresFabricQuality: item.requires_fabric_quality,
          status: initialStatus, currentStage: 'almoxarifado', responsibleUserId: user.id,
          description: validated.description,
          regionJaragua: validated.region_jaragua, regionBrusque: validated.region_brusque, regionGaspar: validated.region_gaspar,
          fiberId: validated.fiber_id, isDualFiber: validated.is_dual_fiber, fiber2Id: validated.fiber2_id,
        },
      });
      await prisma.activityLog.create({ data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId: user.id, details: `Criado por ${user.name}` } });
      createdOps.push(op);
    }

    res.status(201).json({ op_number: createdOps[0].opNumber, id: createdOps[0].id, sheet_id: sheet.id });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos', details: error.errors }); return; }
    res.status(500).json({ error: 'Erro ao criar OP' });
  }
});

router.delete('/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const op = await prisma.productionOrder.findUnique({ where: { id } });
    if (!op) { res.status(404).json({ error: 'OP não encontrada' }); return; }
    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
    await prisma.productionSheet.delete({ where: { id: op.sheetId } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Erro ao excluir OP' });
  }
});

export default router;
