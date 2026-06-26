import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

const schema = z.object({
  item_description: z.string().min(1),
  weight: z.number().positive(),
  destination_sector: z.string().min(1),
  observations: z.string().optional().nullable(),
  defect_image_url: z.string().optional().nullable(),
  employee_name: z.string().min(1),
  inspection_date: z.string(),
});

router.get('/inspections', authMiddleware, async (_req, res): Promise<void> => {
  const inspections = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
  res.json(inspections);
});

router.get('/inspections/:id', authMiddleware, async (req, res): Promise<void> => {
  const inspection = await prisma.fabricQualityInspection.findUnique({ where: { id: parseInt(req.params.id) } });
  if (!inspection) { res.status(404).json({ error: 'Inspeção não encontrada' }); return; }
  res.json(inspection);
});

router.post('/inspections', authMiddleware, async (req, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' } });
    const num = last ? parseInt(last.inspectionNumber.split('-')[1]) + 1 : 1;
    const inspectionNumber = `INS-${String(num).padStart(3, '0')}`;

    await prisma.fabricQualityInspection.create({
      data: { inspectionNumber, itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date },
    });
    res.status(201).json({ success: true, inspection_number: inspectionNumber });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.put('/inspections/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const v = schema.parse(req.body);
    await prisma.fabricQualityInspection.update({
      where: { id: parseInt(req.params.id) },
      data: { itemDescription: v.item_description, weight: v.weight, destinationSector: v.destination_sector, observations: v.observations, defectImageUrl: v.defect_image_url, employeeName: v.employee_name, inspectionDate: v.inspection_date },
    });
    res.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: 'Dados inválidos', details: err.errors }); return; }
    res.status(500).json({ error: 'Erro interno' });
  }
});

router.delete('/inspections/:id', authMiddleware, async (req, res): Promise<void> => {
  await prisma.fabricQualityInspection.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ success: true });
});

export default router;
