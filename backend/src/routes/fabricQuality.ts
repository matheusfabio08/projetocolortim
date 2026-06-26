import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const InspectionSchema = z.object({
  item_description: z.string().min(1),
  weight: z.number(),
  destination_sector: z.string(),
  observations: z.string().optional(),
  defect_image_url: z.string().optional(),
  employee_name: z.string(),
  inspection_date: z.string(),
});

router.get('/inspections', authMiddleware, async (_req, res): Promise<void> => {
  try {
    const inspections = await prisma.fabricQualityInspection.findMany({ orderBy: { inspectionDate: 'desc' } });
    res.json(inspections);
  } catch { res.status(500).json({ error: 'Erro ao buscar inspeções' }); }
});

router.post('/inspections', authMiddleware, async (req, res): Promise<void> => {
  try {
    const validated = InspectionSchema.parse(req.body);
    const last = await prisma.fabricQualityInspection.findFirst({ orderBy: { id: 'desc' }, select: { inspectionNumber: true } });
    let num = 1;
    if (last?.inspectionNumber) num = parseInt(last.inspectionNumber.split('-')[1] || '0') + 1;
    const inspectionNumber = `INS-${String(num).padStart(3, '0')}`;
    const inspection = await prisma.fabricQualityInspection.create({
      data: {
        inspectionNumber, itemDescription: validated.item_description, weight: validated.weight,
        destinationSector: validated.destination_sector, observations: validated.observations,
        defectImageUrl: validated.defect_image_url, employeeName: validated.employee_name,
        inspectionDate: validated.inspection_date,
      },
    });
    res.status(201).json({ success: true, inspection_number: inspectionNumber, id: inspection.id });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro ao criar inspeção' });
  }
});

router.put('/inspections/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const validated = InspectionSchema.parse(req.body);
    await prisma.fabricQualityInspection.update({
      where: { id },
      data: {
        itemDescription: validated.item_description, weight: validated.weight,
        destinationSector: validated.destination_sector, observations: validated.observations,
        defectImageUrl: validated.defect_image_url, employeeName: validated.employee_name,
        inspectionDate: validated.inspection_date,
      },
    });
    res.json({ success: true });
  } catch (error: any) {
    if (error.name === 'ZodError') { res.status(400).json({ error: 'Dados inválidos' }); return; }
    res.status(500).json({ error: 'Erro ao atualizar inspeção' });
  }
});

router.delete('/inspections/:id', authMiddleware, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    await prisma.fabricQualityInspection.delete({ where: { id } });
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Erro ao excluir inspeção' }); }
});

export default router;
