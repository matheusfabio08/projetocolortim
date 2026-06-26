import { Router, Response } from 'express';
import { z } from 'zod';
import { addBusinessDays } from 'date-fns';
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
  fiber_id: z.number().optional(),
  is_dual_fiber: z.boolean().default(false),
  fiber2_id: z.number().optional(),
  items: z.array(ItemSchema).min(1),
});

// GET /api/production-orders/next-op-number
router.get('/next-op-number', authMiddleware, async (req: AuthRequest, res: Response) => {
  const last = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
  const nextNum = last ? parseInt(last.opNumber.replace(/[^0-9]/g, '')) + 1 : 1;
  return res.json({ next_op_number: String(nextNum).padStart(3, '0') });
});

// GET /api/production-orders
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
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
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar ordens de produção' });
  }
});

// GET /api/production-orders/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const op = await prisma.productionOrder.findUnique({
      where: { id },
      include: { activityLogs: { orderBy: { createdAt: 'asc' } } },
    });
    if (!op) return res.status(404).json({ error: 'OP não encontrada' });
    const items = await prisma.productionOrder.findMany({ where: { sheetId: op.sheetId }, orderBy: { opNumber: 'asc' } });
    return res.json({ ...op, items: items.map(i => ({ id: i.id, material: i.material, quantity: i.quantity, unit: i.unit, individual_op: i.opNumber, requires_lab: i.requiresLab })) });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar OP' });
  }
});

// POST /api/production-orders
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = CreatePOSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const validated = result.data;
    const user = req.user!;

    const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' } });
    const sheetNum = lastSheet ? parseInt(lastSheet.sheetNumber.split('-')[1]) + 1 : 1;
    const sheetNumber = `SHEET-${String(sheetNum).padStart(3, '0')}`;

    const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
    const expectedDate = validated.expected_date ? new Date(validated.expected_date) : addBusinessDays(entryDate, 5);

    const sheet = await prisma.productionSheet.create({
      data: { sheetNumber, client: validated.client, color: validated.color, orderNumber: validated.order_number, description: validated.description, entryDate, expectedDate, createdByUserId: user.id },
    });

    const lastOp = await prisma.productionOrder.findFirst({ orderBy: { id: 'desc' } });
    let currentOpNum = lastOp ? parseInt(lastOp.opNumber.replace(/[^0-9]/g, '')) + 1 : 1;

    const createdOps: any[] = [];
    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      const opNumber = String(currentOpNum + i).padStart(3, '0');
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

      await prisma.activityLog.create({
        data: { opId: op.id, stage: 'almoxarifado', action: 'created', userId: user.id, details: `Criado por ${user.name}` },
      });

      createdOps.push(op);
    }

    return res.status(201).json({ op_number: createdOps[0].opNumber, id: createdOps[0].id, sheet_id: sheet.id });
  } catch (error) {
    console.error('Create PO error:', error);
    return res.status(500).json({ error: 'Erro ao criar ordem de produção' });
  }
});

// PUT /api/production-orders/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = CreatePOSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.errors[0].message });
    const validated = result.data;
    const user = req.user!;

    const op = await prisma.productionOrder.findUnique({ where: { id } });
    if (!op) return res.status(404).json({ error: 'OP não encontrada' });

    const entryDate = validated.entry_date ? new Date(validated.entry_date) : new Date();
    const expectedDate = validated.expected_date ? new Date(validated.expected_date) : addBusinessDays(entryDate, 5);

    await prisma.productionSheet.update({
      where: { id: op.sheetId },
      data: { client: validated.client, color: validated.color, orderNumber: validated.order_number, description: validated.description, entryDate, expectedDate },
    });

    const oldOps = await prisma.productionOrder.findMany({ where: { sheetId: op.sheetId }, orderBy: { opNumber: 'asc' } });
    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });

    for (let i = 0; i < validated.items.length; i++) {
      const item = validated.items[i];
      const opNumber = i < oldOps.length ? oldOps[i].opNumber : String(Date.now() + i).padStart(3, '0');
      const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'preparacao';

      const newOp = await prisma.productionOrder.create({
        data: {
          sheetId: op.sheetId, opNumber, client: validated.client, color: validated.color,
          orderNumber: validated.order_number, entryDate, expectedDate,
          material: item.material, quantity: item.quantity, unit: item.unit,
          requiresLab: item.requires_lab, requiresFabricQuality: item.requires_fabric_quality,
          status: initialStatus, currentStage: 'almoxarifado', responsibleUserId: user.id,
          description: validated.description,
          regionJaragua: validated.region_jaragua, regionBrusque: validated.region_brusque, regionGaspar: validated.region_gaspar,
          fiberId: validated.fiber_id, isDualFiber: validated.is_dual_fiber, fiber2Id: validated.fiber2_id,
        },
      });

      await prisma.activityLog.create({
        data: { opId: newOp.id, stage: 'almoxarifado', action: 'updated', userId: user.id, details: `Atualizado por ${user.name}` },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Update PO error:', error);
    return res.status(500).json({ error: 'Erro ao atualizar OP' });
  }
});

// DELETE /api/production-orders/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const op = await prisma.productionOrder.findUnique({ where: { id } });
    if (!op) return res.status(404).json({ error: 'OP não encontrada' });
    // Cascade delete will handle all related records
    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
    await prisma.productionSheet.delete({ where: { id: op.sheetId } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar OP' });
  }
});

// OP start/stop
router.post('/op-start', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { op_id, stage, box_number, machine } = req.body;
    if (!op_id || !stage) return res.status(400).json({ error: 'op_id e stage são obrigatórios' });
    const existing = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: parseInt(op_id), stage } } });
    if (existing) return res.status(400).json({ error: 'OP já em andamento' });
    await prisma.poInProgress.create({ data: { opId: parseInt(op_id), stage, boxNumber: box_number, machine } });
    return res.json({ success: true, started_at: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao iniciar OP' });
  }
});

router.post('/op-stop', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { op_id, stage } = req.body;
    const inProgress = await prisma.poInProgress.findUnique({ where: { opId_stage: { opId: parseInt(op_id), stage } } });
    if (!inProgress) return res.status(400).json({ error: 'OP não está em andamento' });
    await prisma.poInProgress.delete({ where: { id: inProgress.id } });
    return res.json({ success: true, started_at: inProgress.startedAt, stopped_at: new Date().toISOString() });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao parar OP' });
  }
});

router.get('/op-status/:id/:stage', authMiddleware, async (req: AuthRequest, res: Response) => {
  const inProgress = await prisma.poInProgress.findUnique({
    where: { opId_stage: { opId: parseInt(req.params.id), stage: req.params.stage } },
  });
  return res.json({ in_progress: !!inProgress, started_at: inProgress?.startedAt ?? null });
});

export default router;
