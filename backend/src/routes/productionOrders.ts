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
  unit: z.enum(['metros', 'unidades', 'kg']).default('metros'),
  requires_lab: z.boolean().optional().default(false),
  requires_fabric_quality: z.boolean().optional().default(false),
  fiber_id: z.number().nullable().optional(),
  is_dual_fiber: z.boolean().optional().default(false),
  fiber2_id: z.number().nullable().optional(),
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
  items: z.array(ItemSchema).min(1),
});

// Retorna próximo número base de OP (número inteiro sequencial)
async function getNextOpBaseNumber(): Promise<number> {
  const last = await prisma.productionOrder.findFirst({
    orderBy: { id: 'desc' },
    select: { opNumber: true },
  });
  if (!last) return 1;
  // opNumber pode ser "001", "002", etc.
  const n = parseInt(last.opNumber.replace(/-L\d+$/, ''), 10);
  return isNaN(n) ? 1 : n + 1;
}

// Formata número de OP igual ao sistema original
function formatOpNumber(n: number): string {
  return String(n).padStart(3, '0');
}

// ---------------------------------------------------------------
// GET /api/production-orders/next-op-number
// Usado pelo Almoxarifado para preview dos números antes de salvar
// ---------------------------------------------------------------
productionOrdersRouter.get('/next-op-number', async (_req, res) => {
  try {
    const n = await getNextOpBaseNumber();
    return res.json({ next_op_number: formatOpNumber(n) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar próximo número de OP' });
  }
});

// ---------------------------------------------------------------
// GET /api/production-orders
// Lista todas as OPs (formato compatível com frontend original)
// ---------------------------------------------------------------
productionOrdersRouter.get('/', async (req, res) => {
  try {
    const { status, search } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
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
      include: { sheet: true },
    });

    // Agrupa por sheet para retornar uma linha por ficha (igual ao sistema original)
    // O frontend de gerenciamento lista por OP individual
    const mapped = ops.map((op) => ({
      id: op.id,
      op_number: op.opNumber,
      client: op.client,
      color: op.color,
      order_number: op.orderNumber,
      description: op.description,
      entry_date: op.entryDate,
      expected_date: op.expectedDate,
      status: op.status,
      created_at: op.createdAt,
      region_jaragua: op.regionJaragua ? 1 : 0,
      region_brusque: op.regionBrusque ? 1 : 0,
      region_gaspar: op.regionGaspar ? 1 : 0,
    }));

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar OPs' });
  }
});

// ---------------------------------------------------------------
// GET /api/production-orders/:id
// Retorna OP com seus itens (mesmo sheet_id) — formato original
// ---------------------------------------------------------------
productionOrdersRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const op = await prisma.productionOrder.findUnique({
      where: { id },
      include: { sheet: true },
    });
    if (!op) return res.status(404).json({ error: 'OP não encontrada' });

    // Busca todos os itens da mesma ficha (sheet)
    const siblings = await prisma.productionOrder.findMany({
      where: { sheetId: op.sheetId },
      orderBy: { opNumber: 'asc' },
      include: { fiber: true, fiber2: true },
    });

    const items = siblings.map((s) => ({
      id: s.id,
      material: s.material,
      quantity: s.quantity,
      unit: s.unit,
      individual_op: s.opNumber,
      requires_lab: s.requiresLab ? 1 : 0,
      requires_fabric_quality: s.requiresFabricQuality ? 1 : 0,
      fiber_id: s.fiberId,
      fiber2_id: s.fiber2Id,
      is_dual_fiber: s.isDualFiber ? 1 : 0,
      fiber_name: s.fiber?.name ?? null,
      fiber2_name: s.fiber2?.name ?? null,
    }));

    return res.json({
      id: op.id,
      op_number: op.opNumber,
      client: op.client,
      color: op.color,
      order_number: op.orderNumber,
      description: op.description,
      entry_date: op.entryDate,
      expected_date: op.expectedDate,
      status: op.status,
      region_jaragua: op.regionJaragua ? 1 : 0,
      region_brusque: op.regionBrusque ? 1 : 0,
      region_gaspar: op.regionGaspar ? 1 : 0,
      items,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar OP' });
  }
});

// ---------------------------------------------------------------
// POST /api/production-orders
// CRIA ficha de produção — regra original: gerado no Almoxarifado
// Cada item da ficha vira uma OP com número sequencial próprio
// ---------------------------------------------------------------
productionOrdersRouter.post('/', async (req: AuthRequest, res) => {
  try {
    const validated = CreatePOSchema.parse(req.body);
    const user = req.user!;

    const entryDate = validated.entry_date
      ? new Date(validated.entry_date)
      : new Date();
    const expectedDate = validated.expected_date
      ? new Date(validated.expected_date)
      : addBusinessDays(entryDate, 5);

    // Gera número único de sheet
    const lastSheet = await prisma.productionSheet.findFirst({ orderBy: { id: 'desc' } });
    const sheetSeq = lastSheet ? parseInt(lastSheet.sheetNumber.replace('SHEET-', ''), 10) + 1 : 1;
    const sheetNumber = `SHEET-${String(sheetSeq).padStart(3, '0')}`;

    // Cria a ficha (sheet) principal
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

    let currentOpNum = await getNextOpBaseNumber();
    const createdOps: any[] = [];

    for (const item of validated.items) {
      const opNumber = formatOpNumber(currentOpNum);
      // Status inicial: se requer qualidade de malha, vai direto pra lá; senão almoxarifado
      const initialStatus = item.requires_fabric_quality
        ? 'qualidade_malhas'
        : 'almoxarifado';

      const op = await prisma.productionOrder.create({
        data: {
          sheetId: sheet.id,
          opNumber,
          client: validated.client,
          color: validated.color,
          orderNumber: validated.order_number,
          description: validated.description,
          entryDate,
          expectedDate,
          material: item.material,
          quantity: item.quantity,
          unit: item.unit,
          requiresLab: item.requires_lab ?? false,
          requiresFabricQuality: item.requires_fabric_quality ?? false,
          fiberId: item.fiber_id ?? null,
          isDualFiber: item.is_dual_fiber ?? false,
          fiber2Id: item.fiber2_id ?? null,
          status: initialStatus,
          currentStage: 'almoxarifado',
          responsibleUserId: user.id,
          regionJaragua: validated.region_jaragua ?? false,
          regionBrusque: validated.region_brusque ?? false,
          regionGaspar: validated.region_gaspar ?? false,
        },
      });

      await prisma.activityLog.create({
        data: {
          opId: op.id,
          stage: 'almoxarifado',
          action: 'created',
          userId: user.id,
          details: `OP ${opNumber} criada por ${user.name} no almoxarifado`,
        },
      });

      createdOps.push(op);
      currentOpNum++;
    }

    // Retorna no formato que o frontend original espera
    return res.status(201).json({
      id: sheet.id,
      op_number: createdOps[0].opNumber,
      sheet_id: sheet.id,
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar ficha de produção' });
  }
});

// ---------------------------------------------------------------
// PUT /api/production-orders/:id  — edição de ficha existente
// ---------------------------------------------------------------
productionOrdersRouter.put('/:id', async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    // Localiza o op para pegar o sheetId
    const op = await prisma.productionOrder.findUnique({ where: { id } });
    if (!op) return res.status(404).json({ error: 'OP não encontrada' });

    const validated = CreatePOSchema.parse(req.body);
    const user = req.user!;

    const entryDate = validated.entry_date ? new Date(validated.entry_date) : op.entryDate;
    const expectedDate = validated.expected_date ? new Date(validated.expected_date) : op.expectedDate;

    // Atualiza a sheet
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

    // Remove itens antigos da sheet e recria
    await prisma.activityLog.deleteMany({ where: { op: { sheetId: op.sheetId } } });
    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });

    // Mantém o número base original da primeira OP
    let currentOpNum = parseInt(op.opNumber, 10);
    if (isNaN(currentOpNum)) currentOpNum = await getNextOpBaseNumber();
    const createdOps: any[] = [];

    for (const item of validated.items) {
      const opNumber = formatOpNumber(currentOpNum);
      const initialStatus = item.requires_fabric_quality ? 'qualidade_malhas' : 'almoxarifado';

      const newOp = await prisma.productionOrder.create({
        data: {
          sheetId: op.sheetId,
          opNumber,
          client: validated.client,
          color: validated.color,
          orderNumber: validated.order_number,
          description: validated.description,
          entryDate,
          expectedDate,
          material: item.material,
          quantity: item.quantity,
          unit: item.unit,
          requiresLab: item.requires_lab ?? false,
          requiresFabricQuality: item.requires_fabric_quality ?? false,
          fiberId: item.fiber_id ?? null,
          isDualFiber: item.is_dual_fiber ?? false,
          fiber2Id: item.fiber2_id ?? null,
          status: initialStatus,
          currentStage: 'almoxarifado',
          responsibleUserId: user.id,
          regionJaragua: validated.region_jaragua ?? false,
          regionBrusque: validated.region_brusque ?? false,
          regionGaspar: validated.region_gaspar ?? false,
        },
      });

      await prisma.activityLog.create({
        data: {
          opId: newOp.id,
          stage: 'almoxarifado',
          action: 'updated',
          userId: user.id,
          details: `OP ${opNumber} atualizada por ${user.name}`,
        },
      });

      createdOps.push(newOp);
      currentOpNum++;
    }

    return res.json({
      id: op.sheetId,
      op_number: createdOps[0].opNumber,
      sheet_id: op.sheetId,
    });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro ao atualizar ficha' });
  }
});

// ---------------------------------------------------------------
// DELETE /api/production-orders/:id  — exclui ficha inteira
// ---------------------------------------------------------------
productionOrdersRouter.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const op = await prisma.productionOrder.findUnique({ where: { id } });
    if (!op) return res.status(404).json({ error: 'OP não encontrada' });

    await prisma.activityLog.deleteMany({ where: { op: { sheetId: op.sheetId } } });
    await prisma.productionOrder.deleteMany({ where: { sheetId: op.sheetId } });
    await prisma.productionSheet.delete({ where: { id: op.sheetId } });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao excluir ficha' });
  }
});
