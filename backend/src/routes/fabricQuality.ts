import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { z } from 'zod';
const router = Router();
router.use(authMiddleware);
const Schema = z.object({ item_description: z.string().min(1), weight: z.number(), destination_sector: z.string(), observations: z.string().optional(), defect_image_url: z.string().optional(), employee_name: z.string().min(1), inspection_date: z.string() });

router.get('/inspections', async (_req, res) => res.json(await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } })));

router.post('/inspections', async (req, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' } });
    const num = last ? parseInt(last.inspectionNumber.split('-')[1]) + 1 : 1;
    const inspectionNumber = `INS-${String(num).padStart(3, '0')}`;
    await prisma.fabricQualityInspection.create({ data: { inspectionNumber, itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date } });
    res.status(201).json({ success: true, inspection_number: inspectionNumber });
  } catch (e: any) {
    if (e.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro' });
  }
});

router.put('/inspections/:id', async (req, res): Promise<void> => {
  try {
    const v = Schema.parse(req.body);
    await prisma.fabricQualityInspection.update({ where: { id: parseInt(req.params.id) }, data: { itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date } });
    res.json({ success: true });
  } catch { res.status(400).json({ error: 'Dados inválidos' }); }
});

router.delete('/inspections/:id', async (req, res) => {
  await prisma.fabricQualityInspection.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
