import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
const router = Router();
router.use(authMiddleware);

// Gerenciamento - todas as OPs
router.get('/gerenciamento', async (req, res) => {
  const { status, search } = req.query;
  const where: any = {};
  if (status) where.status = String(status);
  if (search) where.OR = [{ opNumber: { contains: String(search), mode: 'insensitive' } }, { client: { contains: String(search), mode: 'insensitive' } }, { color: { contains: String(search), mode: 'insensitive' } }];
  const ops = await prisma.productionOrder.findMany({ where, orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }], include: { activityLogs: { take: 1, orderBy: { createdAt: 'desc' } } } });
  res.json(ops);
});

// PCP
router.get('/pcp', async (_req, res) => {
  const ops = await prisma.productionOrder.findMany({ where: { isCompleted: false }, orderBy: [{ priority: 'desc' }, { expectedDate: 'asc' }] });
  res.json(ops);
});

router.put('/pcp/priority/:id', async (req, res) => {
  const { priority, priority_notes } = req.body;
  await prisma.productionOrder.update({ where: { id: parseInt(req.params.id) }, data: { priority, priorityNotes: priority_notes } });
  res.json({ success: true });
});

router.put('/pcp/sequence/:id', async (req, res) => {
  await prisma.productionOrder.update({ where: { id: parseInt(req.params.id) }, data: { sequenceOrder: req.body.sequence_order } });
  res.json({ success: true });
});

router.get('/pcp/capacity-analysis', async (_req, res) => {
  const stages = ['preparacao', 'producao', 'secadora', 'destrinchagem', 'enrolagem', 'qualidade'];
  const capacity: any = {};
  await Promise.all(stages.map(async (stage) => {
    const [total, urgent] = await Promise.all([
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false } }),
      prisma.productionOrder.count({ where: { status: stage, isCompleted: false, priority: { gte: 3 } } }),
    ]);
    capacity[stage] = { total, urgent };
  }));
  res.json(capacity);
});

router.get('/pcp/overdue', async (_req, res) => {
  const ops = await prisma.productionOrder.findMany({ where: { isCompleted: false, expectedDate: { lt: new Date() } }, orderBy: { expectedDate: 'asc' } });
  res.json(ops);
});

// Almoxarifado
router.get('/almoxarifado', async (_req, res) => {
  const ops = await prisma.productionOrder.findMany({ where: { status: { in: ['preparacao', 'qualidade_malhas'] } }, orderBy: { entryDate: 'asc' } });
  res.json(ops);
});

export default router;
